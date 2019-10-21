# SolarLab-API
SolarLab APIs on AWS Lambda

# Package SAM template
$ sam package --template-file <your yaml>.yaml --s3-bucket s3://solarlab-sam-lambda --output-template-file <your ouput>.yaml

# Deploy packaged SAM template
$ sam deploy --template-file ./<your output>.yaml --stack-name <your stack name> --capabilities CAPABILITY_IAM
