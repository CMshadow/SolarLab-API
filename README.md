# SolarLab-API
SolarLab APIs on AWS Lambda

## Package SAM template

- `<yourYaml>.yaml` : Lambda function package settings
- `<outputYaml>.yaml` : deploy settings
  
```shell
$ sam package --template-file <yourYaml>.yaml --s3-bucket solarlab-sam-lambda --output-template-file <outputYaml>.yaml
```

## Deploy packaged SAM template

- `<outputYaml>.yaml` : deploy settings
- `<yourStackName>` : the name of the lambda function after deployment
  
```shell
$ sam deploy --template-file ./<outputYaml>.yaml --stack-name <yourStackName> --capabilities CAPABILITY_IAM
```
