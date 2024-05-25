export async function waitForSelectorWithBoolean(page: any, selector: any, options = { timeout: 5000 }) {
    try {
      await page.waitForSelector(selector, options);
      return true;
    } catch (e) {
      return false;
    }
  }