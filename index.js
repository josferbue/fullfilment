const { Firestore } = require('@google-cloud/firestore');
const functions = require('@google-cloud/functions-framework');
const projectId = process.env.PROJECT_ID || "jafernandez-tfm";
const credentialsPath = process.env.CREDENTIALS_PATH || "./jafernandez-tfm-c3599be6f666.json";

process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath


async function getModelsByName(model) {
    const db = new Firestore({
        projectId: projectId,
        keyFilename: credentialsPath,
        databaseId: 'catalog'
    });
    const modelsSnapshot = await db.collection('models').where('modelAlias', '=', model.toLowerCase()).get();
    return modelsSnapshot.docs.map(model => model.data());

}

functions.http('fullfilment', async (req, res) => {
    let response;
    if (req.body.queryResult.intent.displayName == "Modelo") {
        const models = await getModelsByName(req.body.queryResult.parameters.Model);
        response = {
            outputContexts: [
                {
                    name: req.body.session + '/contexts/models',
                    lifespanCount: 1,
                    parameters: {
                        models: models
                    }
                }
            ]
        };
        if (models.length == 0) {
            response.fulfillmentText = "No se han encontrado productos relacionados con " + req.body.queryResult.parameters.Model;
        }
        res.send(response);
    } else if (req.body.queryResult.intent.displayName == "Marca") {
        const marca = req.body.queryResult.parameters.brand.toLowerCase();
        let message = "";
        switch (marca) {
            case "hp":
                message = "En las impresoras HP lo más probable es que aparezca en su parte delantera, encima o al lado del panel de control. Sin embargo, si no lo ves en su parte delantera, comprueba su parte superior (algunas DeskJet lo tienen ahí), abre la cubierta y revisa la parte interior de la puerta de acceso a los cartuchos de tinta. Por su parte, el número de serie y el número de producto aparecerán en una etiqueta adhesiva pegada a la impresora. Te recomendamos que lo copies en un papel por si la etiqueta sufre algún desperfecto y necesitas consultar el número más adelante.";
                break;
            case "canon":
                message = "El modelo de una Canon no es siempre fácil de ver a simple vista. De todas formas revisa su parte trasera y delantera y comprueba la zona que rodea la bandeja de entrada del papel. En caso de que no lo encuentres (y esto es común para cualquier impresora que ya esté conectada al ordenador sea de la marca que sea), vete a ‘Inicio’, haz clic en ‘Impresoras y escáneres’ y ahí aparecerá el nombre de tu impresora.";
                break;
            case "epson":
                message = "Si tu impresora es de la marca Epson el modelo aparecerá escrito en la parte frontal debajo del nombre de marca, en la parte superior o en la parte trasera. Recuerda revisar la etiqueta blanca adhesiva para saber el número de serie.";
                break;
            case "brother":
                message = "En las impresoras Brother el modelo o nombre aparece siempre encima, debajo o al lado de la pantalla o de los botones de control. Solo tienes que fijarte.";
                break;
        }
        response = {
            outputContexts: [
                {
                    name: req.body.session + '/contexts/guide',
                    lifespanCount: 1,
                    parameters: {
                        message: message
                    }
                }
            ]
        };
        res.send(response);
    } else {
        res.send({});
    }

});