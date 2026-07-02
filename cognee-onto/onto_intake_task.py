import json
import logging
from typing import Any
import requests
from cognee.modules.pipelines.tasks.task import Task

logger = logging.getLogger(__name__)

def call_onto_read_and_score(url: str, api_key: str = None) -> dict:
    """Mock/Wrapper for Onto's read_and_score endpoint."""
    # In a real environment, this makes an HTTP call to api.buildonto.dev
    # using the ONTO_API_KEY.
    
    # Example Mock Response:
    if "caesar" in url.lower():
        return {
            "markdown": "Doug was found on the roof of Caesar's Palace.",
            "trust_score": 95.0
        }
    return {
        "markdown": f"Cleaned content from {url}",
        "trust_score": 65.0
    }

async def onto_intake_executable(data: Any, *args, **kwargs) -> Any:
    """
    Custom pipeline task that processes incoming URLs using Onto API.
    Inserts before cognify to clean and score data.
    """
    logger.info(f"Running Onto Intake on: {data}")
    
    if isinstance(data, str) and data.startswith("http"):
        # It's a URL, call Onto
        onto_result = call_onto_read_and_score(data)
        
        # Attach metadata to data for the next pipeline step
        return {
            "content": onto_result["markdown"],
            "metadata": {
                "trust_score": onto_result["trust_score"],
                "source": data
            }
        }
    
    return data

# Create the Task wrapper that Cognee's pipeline uses
onto_intake_task = Task(onto_intake_executable, enriches=True)
