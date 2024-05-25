import 'dotenv-flow/config';
import CDP from 'chrome-remote-interface';
import { getOHLC } from "./technicals/candlesticks";
import { Month } from "./datetime/datetime";


const main  = async () => {
    console.log(`${JSON.stringify(await getOHLC(19, Month.December, 2023, 9, 15))}`);
}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed with Resolve: ${res}, Reject: ${rej}`);
})
.catch(err => {
    console.log(`Error in main fn: ${JSON.stringify(err)}`);
});
