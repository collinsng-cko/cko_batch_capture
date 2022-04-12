import * as csv from 'fast-csv';
import * as fs from 'fs';
import { Utils } from './utils';
import * as async from 'async';

const isSandbox = true
const secretKey = "sk_test_916bc342-2c2c-4837-9535-bd5314384a9c"
const filePath = "testData.csv"     /// Pls put the csv under the project dir


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


async function main() {

    const csvData: any = [
        ['payid', 'sourceid', 'amount', 'currency', 'payment_type', 'reference', 'status', 'approved', 'risk', 'captured_actid', 'isFailed'],
    ]

    await Promise.all(
        paymentIds.map(async e => {

            try {

                const paymentInfo = await utils.getPaymentInfo(e)

                if (paymentInfo.status == "Authorized") {
                    const capturedRes = await utils.capture(e)

                    csvData.push([e, paymentInfo.source.id, paymentInfo.amount, paymentInfo.currency, paymentInfo.payment_type, paymentInfo.reference, paymentInfo.status, paymentInfo.approved, paymentInfo.risk.flagged == null || paymentInfo.risk.flagged == false ? false : paymentInfo.risk.flagged, capturedRes.action_id])

                    console.log(`Capture Success | ${e}`)



                }
                else {
                    csvData.push([e, paymentInfo.source.id, paymentInfo.amount, paymentInfo.currency, paymentInfo.payment_type, paymentInfo.reference, paymentInfo.status, paymentInfo.approved, paymentInfo.risk.flagged == null || paymentInfo.risk.flagged == false ? false : paymentInfo.risk.flagged, null, true])
                    console.log(`Status Not Authorized | ${paymentInfo.status} - ${e}`)
                }
            }

            catch (err) {
                csvData.push([e, null, null, null, null, null, null, null, null, null, true])
                console.log(err)
            }

            await new Promise(f => setTimeout(f, 3000));

        })
    )

    const ws = fs.createWriteStream("output.csv")

    csv.write(csvData, { headers: true }).pipe(ws)
}




///     Test Mode

// utils.createDummyPayment()
