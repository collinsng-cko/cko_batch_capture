import * as csv from 'fast-csv';
import * as fs from 'fs';
import { Utils } from './utils';
import '@fast-csv/format';
import { format } from '@fast-csv/format';

const isSandbox = true
const secretKey = "sk_test_916bc342-2c2c-4837-9535-bd5314384a9c"
const filePath = "/Users/collins.ng/Desktop/capture/src/A.csv"


const utils = new Utils(isSandbox, secretKey)
const paymentIds: Array<string> = []

fs.createReadStream(filePath)
    .pipe(csv.parse({ "headers": true }))
    .on('error', error => { throw "Format Invaild" })
    .on('data', (row) => paymentIds.push(row["Payment ID"]))
    .on("end", () => {
        console.log("CSV Extract Successfully")
        main()
    });

// utils.createDummyPayment()

async function main() {

    paymentIds.map(async e => {

        try {

            const paymentInfo = await utils.getPaymentInfo(e)

            if (paymentInfo.status == "Authorized") {
                const capturedRes = await utils.capture(e)
                console.log(`Captured By The Script successfully - ${e}`)
            }
            else {
                throw `Status Not Authorized | ${paymentInfo.status} - ${e}`
            }
        }

        catch (err) {
            console.log(err)
        }

    })
}


