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
    console.log(`Respuesta validacion:${response}`)
    let data = {validated:'disabled'}
    if(response) data.validated = 'completed'
    await updateUser(id, data);

    //const emailMessage = createMessageEvaluationEmail(createMessageEvaluationEmail.validated)
    //try {
      //const emailService = await doctorEvaluationEmail(email, ${lastName} ${firstName}, emailMessage)
    //}catch(err) {
     // console.log(err)
    //}
  }catch(err){
    console.log(err)
  }
}


const validateDoctor = async (document) => {
  const documento = String(document)
  console.log(documento)
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      protocolTimeout: 600000
    });
    console.log('browser iniciado')
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
    page.setDefaultTimeout(600000)
    page.setDefaultNavigationTimeout(600000); 
    console.log(sisaUrl)
    await page.goto(sisaUrl, {
      waitUntil: 'networkidle0'
    });

    const cookies = await page.cookies();
    await page.setCookie(...cookies);
    await page.waitForSelector(selectorRegistro);
    // console.log('encontro el boton')
    await page.click(selectorRegistro)
    // console.log('hizo click en el menu')
    await page.click(selectorTipo)
    await page.locator(imput).fill(documento)
    await page.click(searchButton)

    try {
      try {
        await page.waitForSelector(firstResult, {
          timeout: 3000
        })
      }catch(err) {
        await browser.close();
        console.log('no es medico')
        if(err.name === 'TimeoutError') return false
      }
      await page.click(firstResult)
      await page.waitForSelector(resultTitle, {
        timeout: 5000
      })
      const title = await page.evaluate((resultTitle) => {
        const nombre = document.querySelector(resultTitle);
        return nombre ? nombre.innerText : null; 
      }, resultTitle); 

      const codProf = await page.evaluate((codProfInfo) => {
        const codigo = document.querySelector(codProfInfo)
        return codigo? codigo.innerText: null
      },codProfInfo)
      const data1 = await page.evaluate((tableInfo1) => {
        const table1 = document.querySelector(tableInfo1)
        const rows1 = table1.querySelectorAll('tbody tr');
        return Array.from(rows1, row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns).map(td => td.innerText.trim());
        });
      }, tableInfo1)
      const data2 = await page.evaluate((tableInfo2) => {
        const table2 = document.querySelector(tableInfo2)
        const rows2 = table2.querySelectorAll('tbody tr');
        return Array.from(rows2, row => {
          const columns = row.querySelectorAll('td div');
          return Array.from(columns, column => column.innerText);
        });
      },tableInfo2)
    
      const regex = /Ficha personal de (.+), DNI (\d+)/;
      let nombre = null
      let dni = null
      const match = title.match(regex);
      if (match) {
        nombre = match[1].trim();
        dni = match[2];
      }
      
      const valuesWithNewLines = data1[0].filter(value => value.includes('\n'));
      
      const parsedData = valuesWithNewLines.map(item => {
        const regex = /^(.*)\n{3}Matrícula\s(.+?)\n{3}(?:Especialista\. en: (.+?)\n{3})?Habilitado en (.+)$/;
        const regex2 = /^(.*)\n{3}Matrícula\s(.+?)\n{5}Habilitado en (.+)$/;
        const match = item.match(regex);
        if (match) {
          return {
            especialidad: match[1].trim(),
            matricula: match[2].trim(),
            especialista: match[3] ? match[3].trim() : null,
            habilitadoEn: match[4].trim()
          };
        }
        const match2 = item.match(regex2);
        if (match2) {
          return {
            especialidad: match2[1].trim(),
            matricula: match2[2].trim(),
            habilitadoEn: match2[3].trim()
          };
        }
        return null;
      });

      const matricula = parsedData.filter(item => item !== null);
      const otrosDatos = [...new Set(data2.flat().filter(item => item !== ''))];

      let formatResponse = {
        nombre,
        dni,
        codigoProfesional: codProf,
        matricula,
        otrosDatos
      }
      await browser.close();
      return formatResponse
    } catch (err) {
      await browser.close();
      console.log(err)
      return false
    }
  } catch (err) {
    console.log(err)
    return err
  }
}



module.exports = validateDoctorAndUpdateDB;