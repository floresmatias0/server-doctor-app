const puppeteer = require("puppeteer")
const { updateUser} = require('../controllers/users');
const { doctorEvaluationEmail } =  require('../controllers/messages')
const sisaUrl = process.env.VALIDATE_DOCTOR_URL
const selectorRegistro = process.env.VALIDATE_DOCTOR_RECORD_SELECTOR
const selectorTipo = process.env.VALIDATE_DOCTOR_TYPE_SELECTOR
const imput = process.env.VALIDATE_DOCTOR_INPUT
const searchButton = process.env.VALIDATE_DOCTOR_SEARCH_BUTTON
const firstResult = process.env.VALIDATE_DOCTOR_FIRST_RESULT
const resultTitle = process.env.VALIDATE_DOCTOR_TITLE_RESULT
const codProfInfo = process.env.VALIDATE_DOCTOR_COD_PROF_INFO
const tableInfo1 = process.env.VALIDATE_DOCTOR_TABLE_INFO_1
const tableInfo2 = process.env.VALIDATE_DOCTOR_TABLE_INFO_2

const createMessageEvaluationEmail = (result) => {
  if(result=== 'completed') {
    return 'Su perfil médico ya está habilitado'
  }else {
    return 'Lamentamos informarle que su perfil no puede ser habilitado'
  }
}

const validateDoctorAndUpdateDB = async(id, dni, firstName, lastName, email) => {
  try {
    const response = await validateDoctor(dni)
    console.log(response)
    let data = {validated:'disabled'}
    if(response.matricula) data.validated = 'completed'
    await updateUser(id, data);
    const emailMessage = createMessageEvaluationEmail(createMessageEvaluationEmail.validated)
    try {
      const emailService = await doctorEvaluationEmail(email, `${lastName} ${firstName}`, emailMessage)
    }catch(err) {
      console.log(err)
    }
  }catch(err){
    console.log(err)
  }
}

const validateDoctor = async (document) => {
  const documento = String(document);
  console.log('Documento:', documento);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    );
    page.setDefaultTimeout(600000);

    console.log('Navegando a:', sisaUrl);
    await page.goto(sisaUrl, { waitUntil: 'networkidle0' });

    await page.waitForSelector(selectorRegistro);
    console.log('Botón encontrado, haciendo clic');
    await page.click(selectorRegistro);

    await page.click(selectorTipo);
    await page.type(imput, documento);
    await page.click(searchButton);

    try {
      await page.waitForSelector(firstResult, { timeout: 3000 });
    } catch (err) {
      console.log('No es médico');
      return false;
    }

    await page.click(firstResult);
    await page.waitForSelector(resultTitle);

    const title = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? element.innerText : null;
    }, resultTitle);

    const codProf = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? element.innerText : null;
    }, codProfInfo);

    const data1 = await extractTableData(page, tableInfo1);
    const data2 = await extractTableData(page, tableInfo2, true);

    console.log('Datos obtenidos:', { title, codProf, data1, data2 });

    const regex = /Ficha personal de (.+), DNI (\d+)/;
    const match = title.match(regex);
    const nombre = match ? match[1].trim() : null;
    const dni = match ? match[2] : null;

    const matricula = parseData(data1); // Mueve la lógica de regex a una función separada
    const otrosDatos = [...new Set(data2.flat().filter((item) => item !== ''))];

    const response = {
      nombre,
      dni,
      codigoProfesional: codProf,
      matricula,
      otrosDatos,
    };

    console.log('Respuesta formateada:', response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    return false;
  } finally {
    if (browser) await browser.close();
  }
};




module.exports = validateDoctorAndUpdateDB;