from setuptools import setup, find_packages

setup(
    name="cognee-onto",
    version="0.1.0",
    description="Onto integration and Hangover ontology for Cognee",
    packages=find_packages(),
    install_requires=[
        "cognee",
        "requests",
        "pydantic"
    ],
)
