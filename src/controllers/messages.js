const { Resend }  = require('resend');

const resend = new Resend(process.env.RESEND_KEY);

const reservedShift = async (
    sendTo,
    withCheckIcon = true,
    titleMessage = "Tiene un nuevo turno agendado.",
    patientName = "Juan Perez",
    doctorName = "Rodriguez",
    doctorEspecialization = "Pediatra especialista en desarrollo",
    startDate = "14  junio 2024, 16:00 HS.",
    price,
    bookingId,
    doctorEmail
) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'ZonaMed <onboarding@resend.dev>',
            to: sendTo,
            subject: 'Tiene un nuevo turno agendado',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Nuevo turno agendado</title>
                        <style>
                            /* Estilo para dispositivos móviles */
                            @media screen and (max-width: 600px) {
                            body {
                                width: 100% !important;
                            }
                            .container {
                                width: 100% !important;
                                padding: 0 10px;
                            }
                            }
                        </style>
                    </head>
                    <body style="width: 100%; margin: 0 auto; padding: 0;">
                        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; margin: 0 auto;">
                            <tr>
                            <td>
                                <header style="background-color: #104DBA; height: 32px; width: 100%; border-top-left-radius: 35px; border-top-right-radius: 35px;"></header>
                                <main style="width: 100%; margin: 0 auto;">
                                    <h1 style="color: #474747; font-family: Roboto; font-size: 48px; font-weight: 900; line-height: normal; text-align: center;">¡Hola ${doctorName}!</h1>
                                    ${withCheckIcon && (
                                        `<center>
                                            <img src="https://res.cloudinary.com/ds7tkrjqc/image/upload/v1724161885/qbrqzkw8becudsknxog0.png" width="52px" height="52px" style="margin: 0 auto;" />
                                        </center>`
                                    )}
                                    <h2 style="color: #104DBA; text-align: center; font-family: Roboto; font-size: 24px; font-weight: 900; line-height: normal; width: 347px; margin: 0 auto;">${titleMessage}</h2>
                                    <p style="text-align: center; color: #000; font-family: Roboto; font-weight: 400; line-height: normal; margin: 2em 0;">Le recordamos los datos del turno</p>
                                    <div style="width: 100%;padding: 10px 0;">
                                        <div style="border-radius: 8px;background: #FFF;box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);width: 285px; margin: 0 auto;border:1px solid #474747;">
                                            <p style="color: #000;font-family: Roboto;font-size: 14px;font-weight: 500;line-height: normal;padding: 5px 15px;border-bottom: 1px solid #474747; margin: 0;">Paciente: ${patientName}</p>
                                            <div style="padding: 20px 15px">
                                                <p style="color: #000;font-family: Roboto;font-size: 14px;font-weight: 500;line-height: normal;margin:5px 0;">Dr/Dra. ${doctorName}</p>
                                                <p style="color: #000;font-family: Roboto;font-size: 14px;font-weight: 400;line-height: normal;margin: 5px 0;">${doctorEspecialization}</p>
                                                <div style="display=flex;">
                                                    <img src="https://res.cloudinary.com/ds7tkrjqc/image/upload/v1724619119/yax5ir3jgv74gpiwleeo.png" width="10px" height="10px" style="float: left;padding: 4px 4px 0 0;"/>
                                                    <p style="color: #000;font-family: Roboto;font-size: 14px;font-weight: 400;line-height: normal;margin: 5px 0;">${startDate}</p>
                                                </div>
                                                <div style="display=flex;">
                                                    <img src="https://res.cloudinary.com/ds7tkrjqc/image/upload/v1724619119/yax5ir3jgv74gpiwleeo.png" width="10px" height="10px" style="float: left;padding: 4px 4px 0 0;"/>
                                                    <p style="color: #000;font-family: Roboto;font-size: 14px;font-weight: 400;line-height: normal;margin: 5px 0;">Valor de la consulta: $${price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="margin: 20px auto;text-align:center;">
                                        <a style="color: #FFF;font-size: 9px;font-family: Roboto;line-height: normal;border-radius: 13px;background:#F00;outline:none;border:none;text-decoration:none;padding: 4px;" href="${process.env.BACKEND_URL}/calendars/cancelation/${bookingId}?email=${doctorEmail}">
                                            CANCELAR TURNO
                                        </a>
                                    </div>
                                    <div style="width: 100%; margin: 10px auto; text-align: center;">
                                        <table align="center" style="margin: 2em auto 1em auto;">
                                            <tr>
                                            <td style="text-align: center;">
                                                <img
                                                    src="https://res.cloudinary.com/ds7tkrjqc/image/upload/v1724161925/wskyc6pwjh8khxrfbxgf.png"
                                                    width="72"
                                                    height="42"
                                                    style="display: block; margin: 0 auto;"
                                                />
                                            </td>
                                            <td style="text-align: center;">
                                                <p style="color: #104DBA; font-family: Roboto, sans-serif; font-size: 22.934px; font-weight: 700; line-height: 117.158%; margin: 0;">
                                                    Zona Pediátrica
                                                </p>
                                            </td>
                                            </tr>
                                        </table>
                                    </div>
                                </main>
                                <footer style="border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; background: linear-gradient(61deg, #104DBA -12.14%, #87A6DD 55.27%, #FFF 134.94%); box-shadow: 0px 6px 22px 0px rgba(217, 217, 217, 0.18); width: 100%; height: 80px;">
                                <center style="padding: 1em 0;">
                                    <a style="color: #FFF; font-family: Roboto; font-size: 14px; font-style: normal; font-weight: 400; line-height: normal; text-align: center; margin: 10px 0; text-decoration: none;" href="https://www.zonamed.com.ar" target="__blank">www.zonamed.com.ar</a>
                                </center>
                                <p style="color: #FFF; font-family: Roboto; font-size: 14px; font-style: normal; font-weight: 400; line-height: normal; text-align: center; margin: 0;">© 2024 ZonaMed – Todos los derechos reservados</p>
                                </footer>
                            </td>
                            </tr>
                        </table>
                    </body>
                </html>
            `,
        });

        if (error) {
            console.log(error)
            throw new Error(error)
        }

        return data
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

const doctorEvaluationEmail = async (sendTo, doctorName, titleMessage) => {
    try {
        const {data, error} = await resend.emails.send({
            from: 'ZonaMed <onboarding@resend.dev>',
            to: sendTo,
            subject: 'Resultado de evaluación',
            html: `!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Nuevo turno agendado</title>
                        <style>
                            /* Estilo para dispositivos móviles */
                            @media screen and (max-width: 600px) {
                            body {
                                width: 100% !important;
                            }
                            .container {
                                width: 100% !important;
                                padding: 0 10px;
                            }
                            }
                        </style>
                    </head>
                    <body style="width: 100%; margin: 0 auto; padding: 0;">
                        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; margin: 0 auto;">
                            <tr>
                            <td>
                                <header style="background-color: #104DBA; height: 32px; width: 100%; border-top-left-radius: 35px; border-top-right-radius: 35px;"></header>
                                <main style="width: 100%; margin: 0 auto;">
                                    <h1 style="color: #474747; font-family: Roboto; font-size: 48px; font-weight: 900; line-height: normal; text-align: center;">¡Hola ${doctorName}!</h1>
                                    <h2 style="color: #104DBA; text-align: center; font-family: Roboto; font-size: 24px; font-weight: 900; line-height: normal; width: 347px; margin: 0 auto;">${titleMessage}</h2>
                                    <div style="width: 100%; margin: 10px auto; text-align: center;">
                                        <table align="center" style="margin: 2em auto 1em auto;">
                                            <tr>
                                            <td style="text-align: center;">
                                                <img
                                                    src="https://res.cloudinary.com/ds7tkrjqc/image/upload/v1724161925/wskyc6pwjh8khxrfbxgf.png"
                                                    width="72"
                                                    height="42"
                                                    style="display: block; margin: 0 auto;"
                                                />
                                            </td>
                                            <td style="text-align: center;">
                                                <p style="color: #104DBA; font-family: Roboto, sans-serif; font-size: 22.934px; font-weight: 700; line-height: 117.158%; margin: 0;">
                                                    Zona Pediátrica
                                                </p>
                                            </td>
                                            </tr>
                                        </table>
                                    </div>
                                </main>
                                <footer style="border-bottom-left-radius: 35px; border-bottom-right-radius: 35px; background: linear-gradient(61deg, #104DBA -12.14%, #87A6DD 55.27%, #FFF 134.94%); box-shadow: 0px 6px 22px 0px rgba(217, 217, 217, 0.18); width: 100%; height: 80px;">
                                <center style="padding: 1em 0;">
                                    <a style="color: #FFF; font-family: Roboto; font-size: 14px; font-style: normal; font-weight: 400; line-height: normal; text-align: center; margin: 10px 0; text-decoration: none;" href="https://www.zonamed.com.ar" target="__blank">www.zonamed.com.ar</a>
                                </center>
                                <p style="color: #FFF; font-family: Roboto; font-size: 14px; font-style: normal; font-weight: 400; line-height: normal; text-align: center; margin: 0;">© 2024 ZonaMed – Todos los derechos reservados</p>
                                </footer>
                            </td>
                            </tr>
                        </table>
                    </body>
                </html>`
        })
        if (error) {
            console.log(error)
            throw new Error(error)
        }
        return data
    }catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

module.exports = { reservedShift, doctorEvaluationEmail}