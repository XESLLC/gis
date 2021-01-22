const https = require('https')
const zlib = require('zlib');

//node -e 'require("./index").getCountAndAverageParcelSize()'
function getCountAndAverageParcelSize() {
    console.log('starting gis function getCountAndAverageParcelSize ')
    const options = {
        hostname: 'gis.cupertino.org',
        port: 443,
        path: '/cupgis/rest/services/Public/AmazonData/MapServer/11/query?where=1=1&outFields=*&f=pjson',
        method: 'GET',
        headers: { 'accept-encoding': 'gzip' }
    }
    let buffer = [];
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', chunk => {
            // decompression chunk ready, add it to the buffer
            buffer.push(chunk.toString())
        }).on("end", () => {
            // response and decompression complete, join the buffer and return
            const output = buffer.join("")
            const parcels = JSON.parse(output).features
            const totalParcelsSize = parcels.reduce((initVal, parcel, index) => {
                return initVal + parcel.attributes['Shape.STArea()']
            }, 0)
            const averageParcelSize = totalParcelsSize/parcels.length
            console.log('Number of Parcels: ',parcels.length, '\nAverage Parcel Size: ', averageParcelSize);
        })
    }).on('error', error => {
        console.error(error)
    }).end()
}

module.exports.getCountAndAverageParcelSize = getCountAndAverageParcelSize
