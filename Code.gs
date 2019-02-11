function getAuthType() {
  var response = { type: 'NONE' };
  return response;
}

function getConfig(request) {
  var config = {
    configParams: [
        {
            type: 'INFO',
            name: 'instructions',
            text: 'Enter npm package names to fetch their download count.'
        },
        {
            type: 'TEXTINPUT',
            name: 'package',
            displayName: 'Enter a single package name',
            helpText: 'e.g. googleapis or lighthouse',
            placeholder: 'googleapis'
        }
    ],
    dateRangeRequired: true
  };
  return config;
}

var npmSchema = [
  {
    name: 'packageName',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'downloads',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'day',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY'
    }
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
    'https://api.npmjs.org/downloads/range/',
    request.dateRange.startDate,
    ':',
    request.dateRange.endDate,
    '/',
    request.configParams.package
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var parsedResponse = JSON.parse(response).downloads;
 
  
  // Transform parsed data and filter for requested fields
  var requestedData = parsedResponse.map(function(dailyDownload) {
    var values = [];
    requestedSchema.forEach(function (field) {
      switch (field.name) {
        case 'day':
          values.push(dailyDownload.day.replace(/-/g, ''));
          break;
        case 'downloads':
          values.push(dailyDownload.downloads);
          break;
        case 'packageName':
          values.push(request.configParams.package);
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

