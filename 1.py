from gradio_client import Client
client = Client("https://unknownhackerr-mental-health-beta16.hf.space/")
result = client.predict("im done and happy", api_name="/predict")
print(result)