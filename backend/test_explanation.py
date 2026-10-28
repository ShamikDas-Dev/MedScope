import asyncio

from app.llm.explanation import explain_result


async def main():

    screening_result = {
        "body_part": "wrist",
        "prediction": "Fractured",
        "probabilities": {
            "Fractured": 0.569216,
            "Not Fractured": 0.430784,
        },
    }

    result = await explain_result(
        screening_result
    )

    print("\nEXPLANATION RESULT:")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())