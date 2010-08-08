/*globals module test ok isObj equals expects Namespace */

// ..............................................................................
//
// Origin of the Test Data
//
// This test uses data about a few birds, their official abbreviations, and bird
// feeder observations for each bird in several regions of the United States.
//
// Bird feeder observation data comes from Cornell University's Project Feeder Watch
// (http://watch.birds.cornell.edu/PFW/ExploreData), with data for the top 25 birds in
// two regions, the south-central and southeastern United States for the 2008-2009
// season.
//
// Visit this link to see a map, and click for the regions to see the data in list form:
//
//     http://www.birds.cornell.edu/pfw/DataRetrieval/Top25/2008-2009/Top25.htm
//
// Abbreviation codes for the birds involved were looked up at birdpop.org, which 
// has a dbf file with abbreviations:
// 
//   http://www.birdpop.org/AlphaCodes.htm
//
//   For each bird, there is a four-letter abbreviation, a six-letter abbreviation, 
//   and the same common name that is in the feederObservations.  These abbreviations 
//   could just as well have been stored in the bird data, seen in createBirds(),
//   but are kept separate here for testing purposes.
//
// ..............................................................................

// ONRTest is used as a global container.
var ONRTest = SC.Object.create();

// ONRTest.BirdAppBase is here because if ONRTest.BirdApp = SC.Object.extend(... 
// is used, the datasource will not instantiate properly. But if we use this base
// object, the instantiation works...
ONRTest.BirdAppBase = SC.Object.extend({
  NAMESPACE: null,
  models: null,
  readyCall: null,
  queries: null,
  dataSource: null,
  store: null,
  start: null,
  test: null,
  finish: null
});

// Our simulated Sproutcore app, ONRTest.BirdApp:
ONRTest.BirdApp = ONRTest.BirdAppBase.create({
  // Simulating NAMESPACE for an SC app, set in core.js
  NAMESPACE: 'BirdApp',

  // Models in an SC app are stored as definitions in modelName.js files
  // in the models dir. They are instantiated by the system on startup.
  // Here we define the models as properties directly on our SC app, and
  // we will instantiate them in this.start(), keeping references to 
  // them in a hash called models.

  // The models hash; models will be instantiated in this.start(), and
  // references stored here.
  models: {},

  // Model definitions
  Abbreviation: SC.Record.extend({
    bucket:       'abbreviation',
    type:  SC.Record.attr(String),
    text:  SC.Record.attr(String),
    bird:  SC.Record.toOne("ONRTest.BirdApp.Bird", { inverse: "abbreviations", isMaster: NO }),

    // A handy callback firing on status === READY_CLEAN
    _statusObs: function(){ var status = this.get('status'); if(status && status === SC.Record.READY_CLEAN) ONRTest.BirdApp.readyCall(this.get('storeKey')); }.observes('status')
  }),

  FeederObservation: SC.Record.extend({
    bucket:                      'feederObservation',
    season:                      SC.Record.attr(String),
    region:                      SC.Record.attr(String),
    rank:                        SC.Record.attr(Number),
    percentageOfFeedersVisited:  SC.Record.attr(Number),
    meanGroupSizeWhenSeen:       SC.Record.attr(Number),
    feederwatchAbundanceIndex:   SC.Record.attr(Number),
    bird:                        SC.Record.toOne("ONRTest.BirdApp.Bird", { inverse: "feederObservations", isMaster: NO }),

    // A handy callback firing on status === READY_CLEAN
    _statusObs: function(){ var status = this.get('status'); if(status && status === SC.Record.READY_CLEAN) ONRTest.BirdApp.readyCall(this.get('storeKey')); }.observes('status')
  }),

  Bird: SC.Record.extend({
    bucket:      'bird',
    commonName:  SC.Record.attr(String),
    genus:       SC.Record.attr(String),
    species:     SC.Record.attr(String),
  
    // computed property (recalculates when genus or species changes):
    scientificName: function(){
      return this.getEach('genus', 'species').compact().join(' ');
    }.property('genus', 'species').cacheable(),
    
    // relations:
    abbreviations:      SC.Record.toMany("ONRTest.BirdApp.Abbreviation", { inverse: "bird", isMaster: YES }),
    feederObservations: SC.Record.toMany("ONRTest.BirdApp.FeederObservation", { inverse: "bird", isMaster: YES }),

    // A handy callback firing on status === READY_CLEAN
    _statusObs: function(){ var status = this.get('status'); if(status && status === SC.Record.READY_CLEAN) ONRTest.BirdApp.readyCall(this.get('storeKey')); }.observes('status')
    }),

  // readyCall will fire when the status of any record changes to READY_CLEAN.
  readyCall: function(storeKey){
    var recordType = SC.Store.recordTypeFor(storeKey);
    var id = ONRTest.BirdApp.store.idFor(storeKey);
    var statusString = ONRTest.BirdApp.store.statusString(storeKey);
    var rec = ONRTest.BirdApp.store.materializeRecord(storeKey);
    console.log(recordType + '/' + id + '/' + statusString);
    if (recordType === ONRTest.BirdApp.Bird){
      console.log('ABBREVIATIONS');
      var abbreviations = rec.get('abbreviations');
      for (var i=0,len=abbreviations.length; i<len; i++){
        console.log(abbreviations[i].get('text'));
      }
      var feederObservations = rec.get('feederObservations');
      console.log('FEEDER OBSERVATIONS');
      for (i=0,len=feederObservations.length; i<len; i++){
        console.log(feederObservations[i].get('region'));
      }
    }
    else {
      console.log('BIRD');
      var bird = rec.get('bird');
      if (bird) console.log(bird.get('commonName'));
    }
  },

  // For storing queries that would be defined in core.js
  queries: {},

  // For controllers that would be in controllers dir
  controllers: {},

  // For datasource that would be in data_sources dir
  dataSource: SC.OrionNodeRiakDataSource.extend({
    authSuccessCallback: function(){
      ONRTest.BirdApp.test();
    }
  }),

  // For the store, that would be defined in core.js
  store: SC.Store.create({
    commitRecordsAutomatically: YES
  }).from('ONRTest.BirdApp.dataSource'),

  start: function(){
    // 
    // This function is called by ONRTest.start(), which is called on loading of index.html.
    //
    // At this point:
    //
    //   - this.dataSource has authSuccessCallback set to come to this.test().
    //
    // Things to do here:
    //
    //   - Instantiate the models.
    //   - Force instantiation of the store.
    //   - Make the websocket connection.
    //   - Create queries, controllers, etc.
    //
    console.log("STARTING BirdApp");
    console.log("INSTANTIATING models, store");

    // Instantiate models, keeping handy references in this.models
    this.models['abbreviation'] = this.Abbreviation();
    this.models['feederObservation'] = this.FeederObservation();
    this.models['bird'] = this.Bird();

    // Create the data source if it doesn't exist already. (FORCE instantiation)
    var initDS = this.store._getDataSource(); 

    // Call auth. The data source contains a callback to the test() function.
    this.store.dataSource.wsConnect(ONRTest.BirdApp.store,function(){ 
      ONRTest.BirdApp.store.dataSource.authRequest("test","test");
    });

    // Create queries for later use, as would be done in core.js of a Sproutcore app.
    this.queries['abbreviation'] = {};
    this.queries['abbreviation']['all'] = SC.Query.create({ recordType: ONRTest.BirdApp.Abbreviation});

    this.queries['feederObservation'] = {};
    this.queries['feederObservation']['all'] = SC.Query.create({ recordType: ONRTest.BirdApp.FeederObservation});
    
    this.queries['bird'] = {};
    this.queries['bird']['all'] = SC.Query.create({ recordType: ONRTest.BirdApp.Bird});
    this.queries['bird']['Mockingbird'] = SC.Query.create({ 
      conditions: "genus = {gn_ltrs} AND commonName CONTAINS {ltrs}", 
      parameters: { gn_ltrs:"Mimus", ltrs:"Mockingbird"},
      recordType: ONRTest.BirdApp.Bird});
    this.queries['bird']['Robin'] = SC.Query.create({ 
      conditions: "genus = {gn_ltrs} AND commonName CONTAINS {ltrs}", 
      parameters: { gn_ltrs:"Turdus", ltrs:"Robin"},
      recordType: ONRTest.BirdApp.Bird});

    // Create the controllers.
    this.controllers['feederObservation'] = SC.ArrayController.create({
      addFeederObservation: function(args){
        var season                     = args['season'],
            region                     = args['region'],
            rank                       = args['rank'],
            percentageOfFeedersVisited = args['percentageOfFeedersVisited'],
            meanGroupSizeWhenSeen      = args['meanGroupSizeWhenSeen'],
            feederwatchAbundanceIndex  = args['feederwatchAbundanceIndex'];

        var feederObservation;
    
        // Create a new feederObservation in the store.
        feederObservation = ONRTest.BirdApp.store.createRecord(ONRTest.BirdApp.FeederObservation, {
          "season":                     season,
          "region":                     region,
          "rank":                       rank,
          "percentageOfFeedersVisited": percentageOfFeedersVisited,
          "meanGroupSizeWhenSeen":      meanGroupSizeWhenSeen,
          "feederwatchAbundanceIndex":  feederwatchAbundanceIndex
        });
    
        return feederObservation;
      }
    });

    this.controllers['abbreviation'] = SC.ArrayController.create({
      addAbbreviation: function(args){
        var type = args['type'],
            text = args['text'];

        var abbreviation;

        // Create a new abbreviation in the store.
        abbreviation = ONRTest.BirdApp.store.createRecord(ONRTest.BirdApp.Abbreviation, {
          "type": type,
          "text": text
        });
    
        return abbreviation;
      }
    });

    this.controllers['bird'] = SC.ArrayController.create({
      addBird: function(args){
        var commonName = args['commonName'];
        var genus      = args['genus'];
        var species    = args['species'];

        var bird;

        // Create a new bird in the store.
        bird = ONRTest.BirdApp.store.createRecord(ONRTest.BirdApp.Bird, {
          "commonName": commonName,
          "genus":      genus,
          "species":    species
        });
    
        return bird;
      }
    });
  },
         
  test: function(){
    //
    // Need to provide a callback to finish() for doing tear-down....
    //
    // Data for birds, feeder observations, and abbreviations were
    // put into hashes to allow convenient looping to do the calls
    // to controllers to fire createRecord requests, and other
    // data processing.
    //
    var data = [
      {commonName: "Eastern Towhee", 
       taxonomy: {genus: "Pipilo", species: "erythrophthalmus"},
       feederObservations: [{season: "2008-2009", 
                             region: "Southeastern US", 
                             rank: 17, 
                             percentageOfFeedersVisited: 49.60, 
                             meanGroupSizeWhenSeen: 1.49, 
                             feederwatchAbundanceIndex: 0.25}],
       abbreviations: [{type: 'fourLetter', text: "EATO"}, 
                       {type: 'sixLetter', text: "PIPERP"}]},
      {commonName: "House Finch", 
       taxonomy: {genus: "Carpodacus", species: "mexicanus"},
       feederObservations: [{season: "2008-2009", 
                             region: "Southeastern US", 
                             rank: 8, 
                             percentageOfFeedersVisited: 74.17, 
                             meanGroupSizeWhenSeen: 3.38, 
                             feederwatchAbundanceIndex: 1.32},
                            {season: "2008-2009", 
                             region: "South Central US", 
                             rank: 6, 
                             percentageOfFeedersVisited: 75.37, 
                             meanGroupSizeWhenSeen: 3.58, 
                             feederwatchAbundanceIndex: 1.23}],
       abbreviations: [{type: 'fourLetter', text: "HOFI"}, 
                       {type: 'sixLetter', text: "CARMEX"}]},
      {commonName: "Ruby-crowned Kinglet",
       taxonomy: {genus: "Regulus", species: "calendula"},
       feederObservations: [{season: "2008-2009", 
                             region: "South Central US", 
                             rank: 22, 
                             percentageOfFeedersVisited: 39.76, 
                             meanGroupSizeWhenSeen: 1.17, 
                             feederwatchAbundanceIndex: 0.14}],
       abbreviations: [{type: 'fourLetter', text: "RCKI"}, 
                       {type: 'sixLetter', text: "REGCAL"}]}];
    //
    // Calls are made in this loop to the controllers, to the
    // respective addFeederObservation(), addAbbreviation, and
    // addBird() functions, which make createRecord requests.
    //
    // As these requests are made, references to the records
    // are made so that relations can be set up as we go.
    //
    //     Note the .get() and pushObject() calls.
    //
    for (var i=0,len=data.length; i<len; i++){
      var commonName         = data[i]['commonName'];
      var taxonomy           = data[i]['taxonomy'];
      var feederObservations = data[i]['feederObservations'];
      var abbreviations      = data[i]['abbreviations'];

      var bird = this.controllers['bird'].addBird({
        commonName: commonName,
        genus:      taxonomy.genus,
        species:    taxonomy.species});
      for (var j=0,len2=feederObservations.length; j<len2; j++){
        var feederObservation = this.controllers['feederObservation'].addFeederObservation({
          season:                     feederObservations[j].season,
          region:                     feederObservations[j].region,
          rank:                       feederObservations[j].rank,
          percentageOfFeedersVisited: feederObservations[j].percentageOfFeedersVisited,
          meanGroupSizeWhenSeen:      feederObservations[j].meanGroupSizeWhenSeen,
          feederwatchAbundanceIndex:  feederObservations[j].feederwatchAbundanceIndex});
        var feederObservationsInBird = bird.get('feederObservations');
        feederObservationsInBird.pushObject(feederObservation);
      }
      for (var k=0,len3=abbreviations.length; k<len3; k++){
        var abbreviation = this.controllers['abbreviation'].addAbbreviation({
          type: abbreviations[k].type,
          text:  abbreviations[k].text});
        var abbreviationsInBird = bird.get('abbreviations');
        abbreviationsInBird.pushObject(abbreviation);
      }
    }
  },

  // 
  // Tear-down
  //
  finish: function(){
  //  var storedRecords = this.store.find(this.queries['bird']['all']);
  //  storedRecords.pushObjects(this.store.find(this.queries['feederObservation']['all']));
  //  storedRecords.pushObjects(this.store.find(this.queries['abbreviation']['all']));
  //  for (var i=0,len=storedRecords.length; i<len; i++){
  //    //this.send({deleteRecord: storedRecords[i]});
  //    this.store.deleteRecord(storedRecords[i]);
  //  }
  }
});

ONRTest.start = function(){
  console.log("STARTING CLIENTS");

  this.clients = {};
  //this.clients['FetchMockingbird'] = ONRTest.BirdApp;
  //this.clients['FetchRobin'] = ONRTest.BirdApp;
  this.clients['BirdApp'] = ONRTest.BirdApp;

  for (var clientName in ONRTest.clients){
    ONRTest.clients[clientName].start();
  }
};

