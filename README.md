### FiSDK

FiSDK is an API toolkit developed by Fintechee for managing and controlling the backend of the Fintechee trading platform. Fintechee uses the FIX API to connect to LP(liquidity providers) and provides REST API for traders to use. As a trading platform, there are inevitably a large number of asynchronous interactions between the client and server in order to respond quickly to customer requests. However, these asynchronous operations are very complex, making the REST API difficult to use and control for non-technical personnel. In order to attract more quant traders without technical backgrounds, Fintechee created FiSDK, which integrates a large number of REST APIs and repackages them with a simple interface based on JavaScript.

### The API will be used in the following format:

- fisdk.some_api(some_params);
- fisdk.subscribeToNotification("some_event", callback_function);

Generally, **some_api** is used to send user requests, and **subscribeToNotification("some_event", callback_function)** is used to wait for asynchronous messages from the server, which are then handled by **callback_function**.

Considering that there are a large number of quant traders without technical backgrounds in the financial industry, FiSDK tries to avoid using JavaScript frameworks with a steep learning curve in order to build custom front-end management programs without the need for any complex JS framework foundation, just an HTML file and a JS file will do. In this repository, our custom program consists of two files: dashboard.html and ui.js. This repository also provides some examples for developers to refer to. With FiSDK, you can complete many complex custom operations, such as monitoring risk positions.

### Usage

We provide a website, www.fisdk.com/dashboard.html, specifically for managing the Fintechee backend. If you need custom development, you can download this repository and unzip it to your local computer, and then use it after loading it with any web server, which is very simple.

For testing purposes, Fintechee provides a test white label called "Test Demo1". Admin accounts can log in to test administrator functions, and regular users can log in to test regular trader functions (Fintechee now supports affiliate accounts, so traders can introduce other traders to use the platform and the introducer can view the introduced trader's trading records). If you are interested in becoming the main white label, you can contact us at admin@fintechee.com and we will set up a guest account for you to visit the administrator interface. Regular trader accounts do not need to be specially activated, just register and use them.

### White Label
This repository is a template for the client software of Fintechee trading platform’s main white-label and sub white-label. Once becoming a Fintechee authorized main white-label or sub white-label, acquiring and publishing the client software(including the WEB-trader and the backoffice) is very simple. All that is necessary is to fork this repo, obtain the latest version, replace the original brokers.js with the one delivered by Fintechee, and load it with a regular HTTP server.
