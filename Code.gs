function getAuthType() {
  var response = { type: 'NONE' };
  return response;
}

function getConfig(request) {
  var config = {
    configParams: [
    ]
  };
  return config;
}

var npmSchema = [
  {
    name: 'a',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
    {
    name: 'w',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
  {
    name: 't',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY_HOUR'
    }
  },
  {
    name: 'tm',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'MINUTE'
    }
  },
  {
    name: 'th',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'HOUR'
    }
  },
  {
    name: 'c',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  }  
];

function getSchema(request) {
  return { schema: npmSchema };
}

function getData(request) {
  // Create schema for requested fields
  var requestedSchema = request.fields.map(function (field) {
    for (var i = 0; i < npmSchema.length; i++) {
      if (npmSchema[i].name == field.name) {
        return npmSchema[i];
      }
    }
  });
  
  // Fetch and parse data from API
  var url = [
    'http://a.p6way.net/?all=all'
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var parsedResponse = JSON.parse(response).data;
  //{"data":[{"t":1549904401,"a":".060"},{"t":1549904427,"a":".060"}]}
  
  // Transform parsed data and filter for requested fields
  var requestedData = parsedResponse.map(function(dailyDownload) {
    var values = [];
    requestedSchema.forEach(function (field) {
      switch (field.name) {
        case 'a':
          values.push(dailyDownload.a);
          break;
        case 't':
          values.push((Utilities.formatDate(new Date(dailyDownload.t*1000), 'Asia/Krasnoyarsk', 'yyyyMMddHH')).toString());
          break;
        case 'tm':
          values.push((Utilities.formatDate(new Date((dailyDownload.t-dailyDownload.t%300)*1000), 'Asia/Krasnoyarsk', 'mm')).toString());
          break;
        case 'th':
          values.push((Utilities.formatDate(new Date(dailyDownload.t*1000), 'Asia/Krasnoyarsk', 'HH')).toString());
          break;
        case 'w':
          if((w=dailyDownload.a*12) > 3) values.push(w); else values.push(0);
          break;
        case 'c':
          values.push(parseInt("0"+dailyDownload.c,10));
          break;
        default:
          values.push('');
      }
    });
    return { values: values };
  });
  
  return {
    schema: requestedSchema,
    rows: requestedData
  };
}

