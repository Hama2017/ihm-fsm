## Prerequisites

You have to install hardhat and start a node before you use the API.

Create a node project:
```bash
npm init -y
```

Install hardhat package:
```bash
npm install --save-dev hardhat
```

Create an hardhat project and select `Create an empty hardhat.config.js` with your keyboard and hit enter.:
```bash
npx hardhat init
``` 

Finally, start an hardhat node:
```bash
npx hardhat node
```

## How to start

First, replace path of the [msfsm](https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm) library in `pyproject.toml`.

Then do the following command to install all dependencies:
```bash
poetry install --no-root
```

Finally you can start the API:
```bash
poetry run fastapi dev app/main.py
```


