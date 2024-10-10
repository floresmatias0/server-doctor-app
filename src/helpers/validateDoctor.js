const puppeteer = require("puppeteer")
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

const validateDoctor = async (req) => {
  console.log(req.body)
  const documento = req.body.document
  try {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
    page.setDefaultTimeout(600000)
    await page.goto(sisaUrl, {
      waitUntil: 'networkidle0'
    });

    const cookies = await page.cookies();
    await page.setCookie(...cookies);
    await page.waitForSelector(selectorRegistro);
    console.log('encontro el boton')
    await page.click(selectorRegistro)
    console.log('hizo click en el menu')
    await page.click(selectorTipo)
    await page.locator(imput).fill(documento)
    await page.click(searchButton)

    try {
      await page.waitForSelector(firstResult, {
        timeout: 3000
      })
      await page.click(firstResult)
      await page.waitForSelector(resultTitle, {
        timeout: 3000
      })
      const title = await page.evaluate(() => {
        const nombre = document.querySelector(resultTitle)
        return nombre.innerText
      })
      const codProf = await page.evaluate(() => {
        const codigo = document.querySelector(codProfInfo)
        return codigo.innerText
      })
      const data1 = await page.evaluate(() => {
        const table1 = document.querySelector(tableInfo1)
        const rows1 = table1.querySelectorAll('tbody tr');
        return Array.from(rows1, row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns).map(td => td.innerText.trim());
        });
      })
      const data2 = await page.evaluate(() => {
        const table2 = document.querySelector(tableInfo2)
        const rows2 = table2.querySelectorAll('tbody tr');
        return Array.from(rows2, row => {
          const columns = row.querySelectorAll('td div');
          return Array.from(columns, column => column.innerText);
        });
      })
      console.log(codProf)
      console.log(data1)
      console.log(data2)
      const regex = /Ficha personal de (.+), DNI (\d+)/;
      let nombre = null
      let dni = null
      const match = title.match(regex);
      if (match) {
        nombre = match[1].trim();
        dni = match[2];
      }
      console.log(data1[0])
      const valuesWithNewLines = data1[0].filter(value => value.includes('\n'));
      console.log(valuesWithNewLines)
      
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


      console.log(parsedData)
      const matricula = parsedData.filter(item => item !== null);
      const otrosDatos = [...new Set(data2.flat().filter(item => item !== ''))];

      let formatResponse = {
        nombre,
        dni,
        codigoProfesional: codProf,
        matricula,
        otrosDatos
      }
      console.log(formatResponse)
      await browser.close();
      return formatResponse
    } catch (err) {
      await browser.close();
      console.log(err)
      return 'Documento no encontrado'
    }

  } catch (err) {
    console.log(err)
    return err
  }

}


module.exports = validateDoctor;