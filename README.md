# AI Rate My Professor

This project aims to build a system that rates professors based on AI-driven insights. The project uses both Node.js for the frontend and Python for backend processes.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- [Python](https://www.python.org/downloads/) installed on your machine.
- [Miniconda](https://docs.anaconda.com/miniconda/) installed on your machine.
- [Node.js](https://nodejs.org/) and npm installed.

### 1. Pull the Latest Changes

Before doing anything, ensure you have the latest code from the repository:

```bash
git pull origin main
```

### 2. Install Node.js Dependencies

After pulling the latest code, install the required Node.js packages:

```bash
npm install
```

### 3. Set Up Python Environment

- Make sure [Python](https://www.python.org/downloads/) and [Miniconda](https://docs.anaconda.com/miniconda/) are installed.
- Create the `rag` environment:

```bash
conda create -n rag python=3.10.4
```

- Activate the `rag` environment:

```bash
conda activate rag
```

### 4. Install Python Dependencies

- Install the required Python packages using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

### Additional Notes

- Ensure that your Python environment is correctly set up before proceeding with any Python-related tasks.
- Always remember to run npm install and pip install -r requirements.txt after pulling the latest changes to keep your environment up to date.

## Troubleshooting

- If you encounter any issues with environment setup or dependencies, make sure your Python, Miniconda, and Node.js installations are up to date and that the correct environment is activated.
- If Node.js dependencies fail to install, ensure that your node and npm versions are compatible with the project requirements.
