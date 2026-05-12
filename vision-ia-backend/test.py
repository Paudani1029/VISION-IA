from openai import OpenAI

client = OpenAI(
  api_key="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"
)

response = client.responses.create(
  model="gpt-5.4-mini",
  input="greet me in chilean spanish from the south",
  store=True,
)

print(response.output_text);
