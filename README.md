# SolarLab-API
SolarLab APIs on AWS Lambda, Nodejs codes

## Test Application Locally
- `yourTestEvent.json` : Test event JSON file
- `<functionName>` : The function name defined in template.yaml
```shell
$ sam local invoke <functionName> --event yourTestEvent.json
```

## Package SAM template

- `template.yaml` : Lambda function settings
- `packaged.yaml` : deploy settings
  
```shell
$ sam package --template-file template.yaml --s3-bucket solarlab-sam-lambda --output-template-file packaged.yaml
```

## Deploy packaged SAM template

- `packaged.yaml` : deploy settings
- `solarlab-api` : the name of the stack on CloudFormation after deployment
  
```shell
$ sam deploy --template-file ./packaged.yaml --stack-name solarlab-api --capabilities CAPABILITY_IAM
```
