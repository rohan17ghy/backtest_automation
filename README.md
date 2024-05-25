# backtest_automation

Using gocharting platform

Any technical chart don't use the DOM directly for displaying candles. It uses canvas for displaying candles.
Because of single canvas element it becomes difficult to automate it as the values can't be directly fetched

How to know if a canvas has completed updating on button click ??
For example when i change timeframe the canvas for chart changes, but how to know that canvas is loaded
without any delay

We can monitor the canvas by comparing snapshots of canvas

Configure the browser for remote debugging
    -> Browser needs to be launched with argument `--remote-debugging-port=9222`
    -> command: `chrome --remote-debugging-port=9222`
                        OR 
    -> Traverse to chrome file location
    -> Right click on chrome.exe and click on properties
    -> Go to Shortcut -> Target
    -> after the path add `--remote-debugging-port=9222` 
    -> click apply
