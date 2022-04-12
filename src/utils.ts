import axios from 'axios';

export class Utils {

    url: string
    secretKey: string

    constructor(isSandbox: boolean, secretKey: string) {
        if (isSandbox) {
            this.url = "https://api.sandbox.checkout.com/"
        } else {
            this.url = "https://api.checkout.com/"
        }
        this.secretKey = secretKey
    }

    async capture(paymentId: string) {

        const capturePath = this.url + "payments/" + paymentId + "/" + "captures"

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': this.secretKey
        }

        const res = await axios.post(capturePath, null, { headers: headers }).catch(err => {
            const errRes = err.response
            throw `${res.status} ${res.statusText} - ${paymentId}`
        })

        return res.data

    }

    async getPaymentInfo(paymentId: string) {
        const paymentPath = this.url + "payments/" + paymentId

        const res = await axios.get(paymentPath, { headers: { "Authorization": this.secretKey } }).catch(err => {
            const errRes = err.response
            throw `${errRes.status} ${errRes.statusText} - ${paymentId}`
        })

        return res.data
    }

    async createDummyPayment() {

        if (this.url == "https://api.checkout.com/") {
            throw "Don't use Prod SK For Generate Dummy Payment!!!!!!"
        }

        for (let i = 0; i < 10; i++) {

            const data = {
                "currency": "EUR",
                "amount": 1045,
                "capture": i % 2 == 0,
                "source": {
                    "type": "card",
                    "number": "4242424242424242",
                    "expiry_month": 11,
                    "expiry_year": 2099,
                    "cvv": "100"
                }
            }

            const paymentPath = this.url + "payments"

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': this.secretKey
            }

            const res = await axios.post(paymentPath, data, { headers: headers })

            console.log(res.data.id)


        }

    }
}