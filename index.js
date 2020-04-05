const csv = require('csvtojson')
const dateFns = require('date-fns')
async function init() {
    console.time('teste')
    if(! process.env.SHEET)
        return Promise.reject('Cade a planilha ?')

    const readFile = async () =>
        csv().fromFile(process.env.SHEET)

    const list = await readFile()

    const listAindaASerEntregue = list.filter(it => {
        if(! it['DATA ENTREGA']) //vazio é considerado pascoa
            return true

        const result = dateFns.parse(it['DATA ENTREGA'], 'dd/MM/yyyy', new Date())

        return result.valueOf() >= new Date().valueOf()
    })

    const result = listAindaASerEntregue.reduce((obj, current) => {
        const casca = current['CASCA']
        
        const tamanho = current['TAMANHO']

        const recheio1 = current['RECHEIO 1'].toUpperCase()

        const recheio2 = current['RECHEIO 2'].toUpperCase()

        const especial = current['OVOS ESPECIAIS'].toUpperCase()

        if(obj.cascas[casca]) {
            if(obj.cascas[casca][tamanho])
                obj.cascas[casca][tamanho] = obj.cascas[casca][tamanho] + 1
            else 
                obj.cascas[casca][tamanho] = 1
        }else {
            obj.cascas[casca] = { [tamanho] : 1}
        }


        const buildRecheio = types => {
            for( const type of types ){ 
                if(obj.recheio[type])
                    obj.recheio[type] = obj.recheio[type] + 1
                else 
                    obj.recheio[type] = 1
            }
        }

        buildRecheio([recheio1, recheio2, especial].filter(it => !!it && it !== ''))

        
        return obj
    }, { cascas: {}, recheio:{}})


    console.log(JSON.stringify(result, null, 2))
    console.timeEnd('teste')
}


init()
    .then(x => console.log('fim'))
    .catch(err => {
    console.error(err)
})