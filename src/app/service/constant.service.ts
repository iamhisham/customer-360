import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {

  constructor() { }

  LOGIN = {
    LOGIN_HOME_ROUTE: '/home'
  }

  CONST = {
    CUSTOMER: {
      FIELD_TASK_DETAILS: "(taskNumber,name,description,priority,dueDate,status,assignee)",
      FIELD_CONTACT_DETAILS: "(id,name,dateOfBirth)",
      EMBED_CONTACT_DETAILS: "([id,name,dateOfBirth,type],accounts[id,nickName,accountNumber],contactPointEmails[id,email,isActive,isPrimaryEmail],contactPointPhones[id,extensionNumber,telephoneNumber,isActive,isPrimaryPhone],contactPointAddresses[id,addressLine1,addressLine2,addressLine3,street,city,state,stateProvince,country,postalCode,isPrimaryAddress,isActive],tags)",
      EMBED_CONTACT_DETAILS_ACCOUNT: "(contactPointEmails[id,email,isActive,isPrimaryEmail],contactPointPhones[id,extensionNumber,telephoneNumber,isActive,isPrimaryPhone],contactPointAddresses[id,addressLine1,addressLine2,addressLine3,street,city,state,stateProvince,country,postalCode,isPrimaryAddress,isActive])"
    },
    CASE: {
      FIELD_TICKET_HISTORY: "([id,caseNumber,type,reason,description,createdAt,assignee,status,subject,updatedAt])"
    },
    ORDER: {
      FIELD_OVERVIEW_OPEN_ORDERS: "(id,orderNumber,orderedDate,status,description,name,currencyIsoCode,grandTotalAmount)",
      FIELD_LAST_PURCHASE: "(orderedDate,currencyIsoCode,grandTotalAmount)",
      FIELD_OUT_STANDING: "(currencyIsoCode,outstandingAmount)",
      FIELD_BILLING_DETAILS: "(invoiceNumber,currencyIsoCode,grandTotalAmount,invoiceDate)",
      FIELD_OPEN_ORDERS: "([id,orderNumber,orderedDate,status,description,name,currencyIsoCode,grandTotalAmount])",
      FIELD_OPEN_ORDERS_BY_ID: "(orderItems,fulfillmentOrders,invoices)",
      FIELD_PAYMENT_HISTORY: "(invoiceNumber,invoiceDate,dueDate,grandTotalAmount,currencyIsoCode)",
      FIELD_BILL_HISTORY: "(invoiceNumber,invoiceDate,currencyIsoCode,status,dueDate,fullSettlementDate,grandTotalAmount)",
      FIELD_PURCHASE_HISTORY: "(id,orderedDate,status,currencyIsoCode,grandTotalAmount,name)"
    },
    PAYMENT: {

    },
    SUBSCRIPTION: {
      FIELD_USAGE_DETAILS: "(planName,daysLeft,updatedAt,dataUsedPercentage)",
      FIELD_DATA_OVERVIEW: "(accountId,planName,totalData,dataUnit,status,dataUsedPercentage,dataUsed,dataLeft,daysLeft)",
      FIELD_SUBSCRIPTION_DETAILS: "(id,invoiceNumber,status,grandTotalAmount,dueDate,currencyIsoCode)",
      EMBED_PAYMENT_HISTORY: "([accountId],plan[name,status,dataAllowance,dataAllowanceUnit])",
      EMBED_SERVICE_DETAILS: "([id,activatedAt,status,phoneNumber,subscriptionNumber],plan[name],price[amount,currencyIsoCode])",
    },
    NOTIFICATION: {
      EMBED_NOTIFICATION_HISTROY: "([channel,status,direction,identifier,isSent,sentAt,deliveredAt,viewedAt,content])"
    },
    SEGMENTS: {
      EMBED_GET_ALL: "([id,name,status,description,createdAt,updatedAt])"
    },
    SOURCE_SYSTEM_IMPORT_HISTORY: {
      EMBED_GET_ALL: "([id,sourceSystemId,type,moduleName,sourceSystemObjectName,status,startAt,endAt,duration,fileName],sourceSystem[name])"
    },
    // sourceSystem[name]
    SCHEDULER: {
      EMBED_GET_ALL: "([id,name,occurrence,scheduledAt,scheduleType,status,lastRunAt,lastRunStatus,nextRunAt,updatedAt],sourceSystem)"
    }

  }

  //NOTIFI
  CATEGORY = {
    GET_ALL: {
      embed: "([id,name,priority,status,rateLimit,updatedAt])"
    },
    GET_ALL_NAME: {
      embed: "([id,name])",
      params: { limit: 500, status: 'ACTIVE' },
    }
  };

  TEMPLATE = {
    GET_ALL: {
      embed: "([id,name,status,channels,updatedAt],category[name,id],attachments)"
    }
  };

  USERSEGMENT = {
    GET_ALL: {
      embed: "([id,name,status,description,createdAt,updatedAt])"
    }
  };

  NOTIFICATION = {
    GET_ALL: {
      embed: "([id,channels,errorCode,isScheduled,isProcessed,isBulkNotification,createdAt,processedAt,updatedAt,scheduledAt,status],category[name])"
    }
  };

  ABTESTING = {
    GET_ALL: {
      embed: "([id,channels,errorCode,isBulkNotification,isScheduled,isProcessed,status,createdAt,updatedAt,scheduledAt,variantSettings],category[name])"
    }
  };

  USERPROFILE = {
    GET_ALL: {
      embed: "([id,name,gender,dateOfBirth,language,role,createdAt,updatedAt])"
    }
  };

  QUEUE_NOTIFICATION = {
    GET_ALL: {
      embed: "([id,customerId,notificationId,categoryName,channel,identifier,priority,status,createdAt,isAbTesting])"
    }
  };

  ERROR_NOTIFICATION = {
    GET_ALL: {
      embed: "([id,customerId,channel,notificationId,isScheduled,priority,categoryName,errorCode,retryCount,retryStatus,lastRetryAt,createdAt,updatedAt,userId,isAbTesting])"
    }
  };

  NOTIFICATION_HISTORY = {
    GET_ALL_ERROR_DETAIL: {
      embed: "([id,customerId,categoryName,channel,identifier,priority,errorCode,retryCount,retryStatus,lastRetryAt,createdAt])"
    },
    GET_ALL_QUEUED_DETAIL: {
      embed: "([id,customerId,categoryName,channel,identifier,priority,status])"
    },
    GET_ALL_DIFFERED_DETAIL: {
      embed: "([id,customerId,categoryName,channel,identifier,priority,status,deferredReason,scheduledAt])"
    },
    GET_ALL_DELIVERED_NOTIFICATION: {
      embed: "([id,customerId,categoryName,channel,identifier,priority,status,sentAt])"
    }
  };

  USER_BASE_NOTIFICATOIN_HISTORY = {
    GET_ALL_ERROR_DETAIL: {
      embed: "([id,notificationId,categoryName,channel,identifier,priority,errorCode,retryCount,retryStatus,lastRetryAt,createdAt])"
    },
    GET_ALL_QUEUED_DETAIL: {
      embed: "([id,notificationId,categoryName,channel,identifier,priority,deferredReason,status,scheduledAt,isAbTesting])"
    },
    GET_ALL_DIFFERED_DETAIL: {
      embed: "([id,notificationId,categoryName,channel,identifier,priority,deferredReason,status,scheduledAt,isAbTesting])"
    },
    GET_ALL_DELIVERED_NOTIFICATION: {
      embed: "([id,notificationId,categoryName,channel,identifier,priority,status,createdAt,isAbTesting])"
    }
  };

  VIEW_ATTRIBUTE = {
    GET_ALL_ATTRIBUTE: {
      embed: "([id,name,type,description,createdAt,updatedAt])"
    }
  }
}


// FIELD_OPEN_ORDERS: "(id,orderedDate,status,description,currencyIsoCode,grandTotalAmount,name)",
