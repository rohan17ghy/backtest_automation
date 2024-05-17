import puppeteer from "puppeteer";

const main  = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: false,
        slowMo: 10
    });

    const page = await browser.newPage();

    // Navigate to a webpage
    await page.goto('https://procharting.in/terminal?ticker=NSE:NIFTY');

    await page.waitForSelector('body');

    console.log('Body element is loaded.');

    // const element = document.getElementById('notification-dismiss');
    // console.log(`Notification Dismiss: ${element}`);
    // if(element)
    // {
    //     element.click();
    //     console.log("notification-dismiss is clicked");
    // }
    
    await page.waitForSelector('#notification-dismiss');

    await page.click('#notification-dismiss');

    //Closing the close button
    await page.waitForSelector('.css-juko39-CloseContainer');
    await page.click('.css-juko39-CloseContainer');

    // var result = await page.evaluate(() => {
    //     const element = document.getElementById('notification-dismiss');
    //     if(element){
    //         element.click();
    //         return 'dismiss button clicked';
    //     }

    //     return 'missing dismiss button';
    // });
    
    // console.log(`Dismiss button result: ${result}`);

    await page.click("#interval-selector-btn");

    //Click on the element using page.click()
    await page.click('div[title="1 Minute"]');

    console.log('Giving a timeout of 5 sec');
    await sleep(5000);

    await page.click('#go-to-date-btn');

    await page.waitForSelector('.react-datetime-picker');
    
    console.log('DateTime picker loaded');

    // const dateTimeElement = await page.evaluate(() => {
    //     // Find the input element by its name attribute

    //     var day = document.getElementsByClassName("react-datetime-picker__inputGroup__day").item(0) as HTMLInputElement;
    //     if (day) {
    //         day.value = '2'; // New value you want to set
    //         console.log(`Setting the day to 1`);
    //     }

    //     // const month = document.getElementsByClassName("react-datetime-picker__inputGroup__month").item(0) as HTMLInputElement; //document.querySelector('.react-datetime-picker__inputGroup__month');
    //     // if(month){
    //     //     month.value = '2'
    //     //     console.log(`Setting the month`);
    //     // }

    //     // const year = document.getElementsByClassName("react-datetime-picker__inputGroup__year").item(0) as HTMLInputElement; //document.querySelector('.react-datetime-picker__inputGroup__year');
    //     // if(year){
    //     //     year.value = '2024'
    //     //     console.log(`Setting the year`);
    //     // }

    //     // const hour = document.getElementsByClassName("react-datetime-picker__inputGroup__hour").item(0) as HTMLInputElement; //document.querySelector('.react-datetime-picker__inputGroup__hour');
    //     // if(hour){
    //     //     hour.value = '9'
    //     //     console.log(`Setting the hour`);
    //     // }

    //     // const minute = document.getElementsByClassName("react-datetime-picker__inputGroup__minute").item(0) as HTMLInputElement; //document.querySelector('.react-datetime-picker__inputGroup__minute');
    //     // if(minute){
    //     //     minute.value = '15'
    //     //     console.log(`Setting the minute`);
    //     // }

    //     // const amPm = document.getElementsByClassName("react-datetime-picker__inputGroup__amPm").item(0) as HTMLInputElement; //document.querySelector('.react-datetime-picker__inputGroup__amPm');
    //     // if(amPm){
    //     //     amPm.value = 'am';
    //     //     console.log(`Setting AM PM`);
    //     // }
        
    //     const dateTimeElement = document.getElementsByClassName("react-datetime-picker__inputGroup__day").item(0) as HTMLInputElement;

    //     return dateTimeElement.value;

    // });

    page.click('.react-datetime-picker__calendar-button');

    console.log('Giving a timeout of 5 sec');
    await sleep(5000);

    await page.screenshot({ path: `C:\\Users\\Debopriya\\Downloads\\pupeeter0.png`});
        
    // const dateButton = await page.evaluate(() => {
    //     const dateButton =  document.querySelector('button > abbr[value="2"]')?.parentElement;
    //     dateButton?.click();
    //     return dateButton;
    // });



    //const buttonElements = await page.$$('.react-calendar__month-view__days > button > abbr[aria-label="May 2, 2024"]');
    const buttonElement = await page.$('button > abbr[aria-label="May 2, 2024"]');
    if (buttonElement) {
        console.log(`Found the date button ${JSON.stringify(buttonElement)}`);
        var button2May = await buttonElement.click();
        console.log(`Button: ${button2May}`);
    }else{
        console.log(`Didn't found the date button`);
    }

    // console.log(`DateButton: ${dateButton}`);

    console.log('Giving a timeout of 5 sec');
    await sleep(5000);
   
    await page.screenshot({ path: `C:\\Users\\Debopriya\\Downloads\\pupeeter1.png`});

    page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        // Iterate through each button to find the one with text content 'Apply'
        const applyButton = buttons.find(button => button.textContent?.trim() === 'Apply');
        // Click the button if found
        if (applyButton) {
            applyButton.click();
        } else {
            console.log('Button not found.');
        }
    })
    
    //Clicking on Apply Button
    //await page.click('.css-tknai7-Button-Button1');

    //await page.click('button:contains("Apply")');
    
    // Get the child elements of the parent div using page.evaluate()

    //console.log(`Values after setting date: ${dateTimeElement}`);

    console.log('Giving a timeout of 5 sec');
    await sleep(5000);

    await page.screenshot({ path: `C:\\Users\\Debopriya\\Downloads\\pupeeter2.png`});

    await page.waitForSelector('.tooltip-ohlc');
    console.log('OHLC loaded to the assigned date and time');

    const childElements = await page.evaluate(() => {
        // Select the parent div using class name
        const parentDiv = document.querySelector('.tooltip-ohlc');
        if (parentDiv) {
            // Use querySelectorAll or getElementsByClassName to get child elements
            const children = parentDiv.children;
            // Convert NodeList to Array and extract text content
            return Array.from(children).map(child => child.textContent);
        } else {
            return []; // Return an empty array if parent div is not found
        }
    });    

    await page.screenshot({ path: `C:\\Users\\Debopriya\\Downloads\\pupeeter3.png`});
    
    console.log(`OHLC: ${JSON.stringify(childElements)}`);

    console.log(`Browser: ${JSON.stringify(browser)} Page: ${JSON.stringify(page)}`);

    await browser.close();
}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed with Resolve: ${res}, Reject: ${rej}`);
})
.catch(err => {
    console.log(`Error: ${err}`);
});

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}