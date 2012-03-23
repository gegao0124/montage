/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    JSONP = require('components/autocomplete-example.reel/jsonp.js').JSONP;


// Sample data for list of US States
var states = [
    {name: "Alabama", code: "AL" }, 
    {name: "Alaska", code: "AK"}, 
    {name: "Arizona", code: "AZ"},
    {name: "Arkansas", code: "AR"}, 
    {name: "California", code: "CA"}, 
    {name: "Colorado", code: "CO"}, 
    {name: "Connecticut", code: "CT"}, 
    {name: "Delaware", code: "DE"}, 
    {name: "District Of Columbia", code: "DC"}, 
    {name: "Florida", code: "FL"}, 
    {name: "Georgia", code: "GA"}, 
    {name: "Hawaii", code: "HI"}, 
    {name: "Idaho", code: "ID"}, 
    {name: "Illinois", code: "IL"}, 
    {name: "Indiana", code: "IN"}, 
    {name: "Iowa", code: "IA"}, 
    {name: "Kansas", code: "KS"}, 
    {name: "Kentucky", code: "KY"}, 
    {name: "Louisiana", code: "LA"}, 
    {name: "Maine", code: "ME"}, 
    {name: "Maryland", code: "MD"}, 
    {name: "Massachusetts", code: "MA"}, 
    {name: "Michigan", code: "MI"}, 
    {name: "Minnesota", code: "MN"}, 
    {name: "Mississippi", code: "MS"}, 
    {name: "Missouri", code: "MO"}, 
    {name: "Montana", code: "MT"}, 
    {name: "Nebraska", code: "NE"}, 
    {name: "Nevada ", code: "NV"}, 
    {name: "New Hampshire", code: "NH"}, 
    {name: "New Jersey", code: "NJ"}, 
    {name: "New Mexico", code: "NM"}, 
    {name: "New York", code: "NY"}, 
    {name: "North Carolina", code: "NC"}, 
    {name: "North Dakota", code: "ND"}, 
    {name: "Ohio", code: "OH"}, 
    {name: "Oklahoma ", code: "OK"}, 
    {name: "Oregon", code: "OR"}, 
    {name: "Pennsylvania", code: "PA"}, 
    {name: "Rhode Island", code: "RI"}, 
    {name: "South Carolina", code: "SC"}, 
    {name: "South Dakota", code: "SD"}, 
    {name: "Tennessee", code: "TN"}, 
    {name: "Texas", code: "TX"}, 
    {name: "Utah", code: "UT"}, 
    {name: "Vermont", code: "VT"}, 
    {name: "Virginia", code: "VA"}, 
    {name: "Washington", code: "WA"}, 
    {name: "West Virginia", code: "WV"}, 
    {name: "Wisconsin", code: "WI"}, 
    {name: "Wyoming", code: "WY"} 
];

var toQueryString = function(obj) {
   if(obj) {
       var arr = [], key, value;
       for(var i in obj) {
           if(obj.hasOwnProperty(i)) {
               key = encodeURIComponent(i);
               value = encodeURIComponent(obj[i]);
               // @todo - handle arrays as value
               arr.push(key + encodeURIComponent('=') + value);
           }
       }
       return arr.join('&');
   }
   return '';
};

var request = function(uri, method, params) {

    params = params || {};
    method = method || 'get';
    var url = uri + '?' + toQueryString(params);
    console.log('Request: ' + url);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.open(method, url, true);
    xhr.send(null);

    return xhr;
};

var jsonp = function(uri, params, callback) {
    JSONP.get(uri, params, callback);
};



exports.AutocompleteExample = Montage.create(Component, {

    json: {value: null},

    country: {value: null},
    state: {value: null},
    selectedStates: {value: null},
    members: {value: null},
    info: {value: null},
    
    _cachedStates: {value: null},

    countryShouldGetSuggestions: {
        value: function(autocomplete, searchTerm) {

            var results = [];
            searchTerm = searchTerm.toLowerCase();

            if(searchTerm.indexOf('a') === 0) {
                results = ['Afghanistan', 'Algeria', 'Armenia'];
            } else if(searchTerm.indexOf('b') === 0) {
                results = ['Bosnia', 'Belarus'];
            } else {
                results = ['USA', 'India'];
            }

            //autocomplete.suggestions = results;
            // to simulate API call

            setTimeout(function() {
                autocomplete.suggestions = results;
            }, 1000);


        }
    },

    stateShouldGetSuggestions: {
        value: function(autocomplete, searchTerm) {
            var results = [];
            if(searchTerm) {
                var term = searchTerm.toLowerCase();
                if(this._cachedStates && this._cachedStates[term]) {
                    results = this._cachedStates;
                } else {
                    results = states.filter(function(item) {
                        // @todo - memoize
                        return (item.name.toLowerCase().indexOf(term) >= 0 || item.code.indexOf(term) >= 0);
                    });
                    this._cachedStates = results;
                }                
            }
            autocomplete.suggestions = results.map(function(item) {
                return item.name;
            });                
        }
    },

    membersShouldGetSuggestions: {
        value: function(autocomplete, searchTerm) {
            var results = [];
            // The data set is based on https://www.google.com/fusiontables/DataSource?docid=1QJT7Wi2oj5zBgjxb2yvZWA42iNPUvnvE8ZOwhA
            // Google fusion tables # 383121. However Google's API returns a CSV. So need to use this app to convert to json
            var query = "SELECT FirstName,LastName from 383121 where FirstName like '%" + searchTerm + "%'"; //" OR LastName like '%" + searchTerm + "%'";
            var uri = 'http://ft2json.appspot.com/q?sql=' + encodeURIComponent(query);
                        
            console.log('searching ...', uri);
            var xhr = request(uri, 'get');
            xhr.onload = function(e) {
               try {
                   var data;
                   data = JSON.parse(this.response).data;
                   var result = [];
                   if(data && data.length > 0) {
                       result = data.map(function(item) {
                           return item.FirstName + ' ' + item.LastName;
                       });
                   }
                   autocomplete.suggestions = result;

               } catch(e) {
                   autocomplete.suggestions = [];
               }

            };
            xhr.ontimeout = function() {
               console.log('xhr timed out');
               autocomplete.suggestions = [];
            };
            xhr.onerror = function(e) {
                console.log('xhr errored out');
               autocomplete.suggestions = [];
            };
            

            /*
            JSONP.request(, null, function(data) {
                var result = [];
                console.log('received data', data);
                if(data && data.length > 0) {
                    result = data.result.places.map(function(item) {
                        return item.FirstName;
                    });
                }
                console.log('result', result);
                autocomplete.suggestions = result;
            });
            */

        }
    },

    prepareForDraw: {
        value: function() {
            this.country = "Foo";
            this.state = "Bar";
        }
    },

    handleUpdateAction: {
        value: function(event) {   
            console.log('data: ', this);         
            this.json = JSON.stringify({
                country: this.country,
                state: this.state,
                members: this.members,
                info: this.info

            });
        }
    }
});
