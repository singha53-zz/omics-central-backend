import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

const ECS_CLUSTER_NAME = process.env.ECS_CLUSTER_NAME;
const ECS_TASK_DEFINITION = process.env.ECS_TASK_DEFINITION;
const ECS_TASK_VPC_SUBNET_1 = process.env.ECS_TASK_VPC_SUBNET_1;
const ECS_TASK_VPC_SUBNET_2 = process.env.ECS_TASK_VPC_SUBNET_2;
const AWS_REGION = process.env.AWS_REGION;


export async function main(event, context) {
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
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}
