const CiscoFmc = require('./CiscoFmc');
require('log-timestamp');

let ciscoFmc = new CiscoFmc('fmc.acme.com', 'apiuser', 'cisco123', false);

setInterval(() => {
  ciscoFmc
    .config('GET', '/deployment/deployabledevices')
    .catch((err) => {
      throw err;
    })
    .then((response) => {
      console.log('Deployable Devices');
      console.dir(response, { depth: null });
    })
    .catch((err) => {
      console.log('catch in config');
      console.dir(err, { depth: null });
    });
}, 5000);

setInterval(() => {
  ciscoFmc
    .platform('GET', '/serverversion')
    .catch((err) => {
      throw err;
    })
    .then((response) => {
      console.log('Server Version');
      console.dir(response, { depth: null });
    })
    .catch((err) => {
      console.log('catch in platform');
      console.dir(err, { depth: null });
    });
}, 5000);

// Some other samples

// ciscoFmc
//   .config('POST', '/deployment/deploymentrequests', {
//     deviceList: ['33469b8a-c468-11eb-a889-8c69b083f8d8'],
//     deploymentNote: 'from nodejs',
//     type: 'DeploymentRequest',
//     version: '1638529122389',
//   })
//   .then((response) => {
//     console.log('Deployement Request');
//     console.log(response);
//   });

// ciscoFmc.config('GET', '/object/networks', null, true).then((response) => {
//   console.log('Object Networks');
//   response.items.forEach((element) => {
//     console.log(element.name, element.value);
//   });
// });

// ciscoFmc.config('GET', '/object/dynamicobjects').then((response) => {
//   console.log('DynamicObjects');
//   console.dir(response, { depth: null });
// });

// ciscoFmc
//   .config('GET', `/object/dynamicobjects/myBlackList/mappings`)
//   .then((response) => {
//     console.log('DynamicObjectsMappings');
//     console.dir(response, { depth: null });
//   });

// ciscoFmc
//   .config('PUT', `/object/dynamicobjects/myBlackList/mappings?action=add`, {
//     mappings: ['192.168.1.241'],
//   })
//   .then((response) => {
//     console.log('DynamicObjectsMappings');
//     console.dir(response, { depth: null });
//   });

// ciscoFmc
//   .config(
//     'PUT',
//     `/object/dynamicobjects/myBlackList/mappings?action=remove`,
//     {
//       mappings: ['192.168.1.241'],
//     }
//   )
//   .then((response) => {
//     console.log('DynamicObjectsMappings');
//     console.dir(response, { depth: null });
//   });

// ciscoFmc.config('GET', '/policy/ftdnatpolicies').then((response) => {
//   console.log('nat policies');
//   console.dir(response, { depth: null });
// });

// ciscoFmc.config('GET', '/policy/accesspolicies').then((response) => {
//   console.log('Access Policies');
//   console.dir(response, { depth: null });
// });

// ciscoFmc
//   .config('POST', '/object/fqdns', {
//     name: 'TestFQDN',
//     type: 'FQDN',
//     value: 'downloads.cisco.com',
//     dnsResolution: 'IPV4_ONLY',
//     description: 'Test Description',
//   })
//   .then((response) => {
//     console.log('Object Networks');
//     console.dir(response, { depth: null });
//   });

// ciscoFmc.config('GET', '/object/fqdns', null, true).then((response) => {
//   console.log('Object FQDNs');
//   console.dir(response, { depth: null });
// });

// ciscoFmc.config('GET', '/devices/devicerecords', null, true).then((response) => {
//   console.log('device records');
//   console.dir(response, { depth: null });
// });

// ciscoFmc
//   .config(
//     'GET',
//     '/devices/devicerecords/33469b8a-c468-11eb-a889-8c69b083f8d8/physicalinterfaces',
//     null,
//     true
//   )
//   .then((response) => {
//     console.log('device records physical interfaces');
//     console.dir(response, { depth: null });
//   });
