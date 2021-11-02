# vultr-vscode

vultr-vscode is a node.js utility that enables you to create a virtual machine on vultr and host Visual Code on the browser

# Motivation

I have been using Gitpod for quite some time and I liked the idea of being able to code from any place with the same settings and extensions of VS Code that I use daily. However the downside of Gitpod is that it's very expensive in comparison with vultr. I created this tool because I found the concept very interesting and wanted to achieve the same service that Gitpod provides but with less costs.


# Requirements

- Nodejs
- NPM

# Installation

Simply clone the repository and install the modules: 

```
git clone https://github.com/naseif/vultr-vscode.git
cd vultr-vscode
npm i
```

# How to use

## Creating an Instance
First of all you are going to need your Vultr API Key to initalize the vultr client. You can find your API Key [here](https://my.vultr.com/settings/#settingsapi)

To create a server with the defaults:

```
node index.js --key APIKEY --defServer
```

This will create a server with the following specs: 
```js
const defaults = {
  plan: "vc2-2c-4gb", // 2 Cores, 4GB RAM Server
  region: "fra", // Location: Frankfurt
  os: "387", // OS : Ubuntu 20.04
};
```
To avoid providing the API key each time you want to create an instance, execute the following command:

```
node index.js --init
```
This will ask for the API Key and the prefered server specs (plan, region, os) and then create a config file at `/Config/vultr_config.json`

Ìf you went through --init, all you have to do next time you want to create an instance is executing the following:

```
node index.js --start
```

## Destroying the Instance

When creating an instance, a file called `instance.json` will be created and saved under `/Config/instance.json`

This file will contain the newly created instance info such as IP, ID, and Password.

To stop the Instance, execute the following:

```
node index.js --stop
```

if the config file does not exist, it will default to prompts and ask after the API Key and the ID of the instance to destroy.

## Contributions

Software contributions are welcome. If you are not a dev, testing and reproting bugs can also be very helpful!

## Questions?

Please open an issue if you have questions, wish to request a feature, etc.
