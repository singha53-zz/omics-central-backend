import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

const ECS_CLUSTER_NAME = process.env.ECS_CLUSTER_NAME;
const ECS_TASK_DEFINITION = process.env.ECS_TASK_DEFINITION;
const ECS_TASK_VPC_SUBNET_1 = process.env.ECS_TASK_VPC_SUBNET_1;
const ECS_TASK_VPC_SUBNET_2 = process.env.ECS_TASK_VPC_SUBNET_2;
// const AWS_REGION = process.env.AWS_REGION;

// const ecsApi = require('./ecs');

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    console.log(JSON.stringify(event));
    console.log(`A new video file '${key}' was uploaded to '${bucket}' for processing.`);

    runThumbnailGenerateTask();

    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}


var runThumbnailGenerateTask = () => {

  // run an ECS Fargate task
  const params = {
    cluster: `${ECS_CLUSTER_NAME}`,
    launchType: 'FARGATE',
    taskDefinition: `${ECS_TASK_DEFINITION}`,
    count: 1,
    platformVersion:'LATEST',
    networkConfiguration: {
      awsvpcConfiguration: {
          subnets: [
              `${ECS_TASK_VPC_SUBNET_1}`,
              `${ECS_TASK_VPC_SUBNET_2}`
          ],
          assignPublicIp: 'ENABLED'
      }
    },
    overrides: {
      containerOverrides: [
        {
          name: 'ffmpeg-thumb'
        }
      ]
    }
  };
  console.log("run ECS params: " + JSON.stringify(params));
  // ecsApi.runECSTask(params);
};