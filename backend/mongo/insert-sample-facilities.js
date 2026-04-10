const dbName = 'smartcampus';
const resourcesCollection = 'resources';

const sampleResources = [
  {
    _id: '64b8f1a00000000000000111',
    name: 'Innovation Hub Room 1',
    type: 'ROOM',
    capacity: NumberInt(80),
    location: 'Block D, 1st Floor',
    availabilityWindow: 'Mon-Fri 08:00-19:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000112',
    name: 'AI Research Lab',
    type: 'LAB',
    capacity: NumberInt(30),
    location: 'Block E, 3rd Floor',
    availabilityWindow: 'Mon-Sat 09:00-18:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000113',
    name: 'Wireless Presenter Kit',
    type: 'EQUIPMENT',
    capacity: NumberInt(1),
    location: 'Resource Desk, Library',
    availabilityWindow: 'Mon-Fri 09:00-17:00',
    status: 'OUT_OF_SERVICE',
  },
];

const smartCampusDb = db.getSiblingDB(dbName);

for (const resource of sampleResources) {
  smartCampusDb[resourcesCollection].updateOne(
    { _id: resource._id },
    { $set: resource },
    { upsert: true }
  );
}

print(`Upserted sample records: ${sampleResources.length}`);
