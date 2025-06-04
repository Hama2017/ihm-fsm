<div align="center">
  <img src="https://i.postimg.cc/8zhJqGVt/logo-msfsm.png" alt="MSFSM Logo" width="350"/>
  <h1>MSFSM — Multi-Scale Finite State Machine</h1>
</div>
<div align="center">

[![pipeline status](https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm/badges/main/pipeline.svg)](https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm/-/pipelines) [![last commit](https://img.shields.io/gitlab/last-commit/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm)](https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm) [![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

> The msfsm module is designed to generate, compile, and deploy smart contracts from a multi-scale specification of non-deterministic finite state machines. Currently, it only supports generating Solidity code for Ethereum platform.  
> ⚠️ For research purposes only — **not production-ready**.

</div>


##  Overview

**MSFSM** is a Python-based toolkit that transforms FSM specs into deployable Solidity contracts.  
It is built with modularity in mind and supports Ethereum-compatible blockchains.

---

## Key Features

- Generate Solidity smart contracts from FSMs
- Non-deterministic logic support
- JSON-based multi-scale package system
- Ethereum integration with full RPC configuration
- Clean separation between config, generation, and deployment logic

---

## Installation

```bash
git clone https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm.git
cd msfsm
poetry install
```

> Or use `pip install -r requirements.txt` if not using Poetry.

---

## Quick Start

### 1. Prepare your FSM specs:

```bash
.
├── examples/
│   ├── dag.json         # Main FSM specification
│   ├── p1.json          # Additional package
│   └── p2.json
```

### 2. Write your deployment script:

```python
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from msfsm.solidity.generator import GeneratorSolidity

config = ConfigEthereum(
    target="ethereum",
    platform=EthereumPlatform(
        sol_version="0.8.0",
        provider_url="http://localhost:8545",
        chain_id=31337,
        pub_key="YOUR_PUBLIC_KEY",
        priv_key="YOUR_PRIVATE_KEY",
    ),
)

generator = GeneratorSolidity(
    specification_path="./examples/dag.json",
    packages_path=["./examples/p1.json", "./examples/p2.json"],
    config=config
)

generator.deploy()
```

### 3. Deploy:

```bash
poetry run python examples/deploy_contract.py
```

---

## Directory Structure

```
msfsm/
├── msfsm/                # Core Python package
│   ├── solidity/         # Ethereum + Solidity logic
│   └── ...
├── examples/             # FSM specs and example packages
├── tests/                # Unit tests
├── pyproject.toml        # Poetry config
└── README.md             # This file
```

---

## Advanced Configuration

- Update `ConfigEthereum` to fit your local/private network settings
- Customize Solidity version, keys, or endpoints
- Support for multiple packages and modular specifications

---


## Documentation

The project includes a clean Python API, and you can generate HTML documentation directly from the code using [**pdoc**](https://pdoc.dev).

If `pdoc` is already installed (via Poetry or pip), run:

```bash
poetry run pdoc msfsm --output-dir docs --force
```

This will create a folder called `docs/` containing the HTML documentation. You can open it in your browser:

```bash
xdg-open docs/msfsm/index.html  # Linux
open docs/msfsm/index.html      # macOS
start docs\msfsm\index.html   # Windows
```

## Disclaimer

This software is provided **as is** and is meant **only for academic and research purposes**.  
It is not secure, audited, or tested for production environments. Use at your own risk.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.