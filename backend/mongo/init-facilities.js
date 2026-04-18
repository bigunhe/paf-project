const dbName = 'smartcampus';
const resourcesCollection = 'resources';

const resources = [
  {
    _id: '64b8f1a00000000000000101',
    name: 'Main Auditorium',
    type: 'ROOM',
    capacity: 250,
    location: 'Block A, Ground Floor',
    availabilityWindow: 'Mon-Fri 08:00-20:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000102',
    name: 'Computer Lab 2',
    type: 'LAB',
    capacity: 40,
    location: 'Block C, 2nd Floor',
    availabilityWindow: 'Mon-Fri 08:00-18:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000103',
    name: 'Meeting Room 4B',
    type: 'ROOM',
    capacity: 12,
    location: 'Block B, 4th Floor',
    availabilityWindow: 'Mon-Fri 09:00-17:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000104',
    name: 'Portable Projector P-12',
    type: 'EQUIPMENT',
    capacity: 1,
    location: 'Media Store, Block A',
    availabilityWindow: 'Mon-Sat 09:00-17:00',
    status: 'ACTIVE',
  },
  {
    _id: '64b8f1a00000000000000105',
    name: 'Conference Camera Kit',
    type: 'EQUIPMENT',
    capacity: 1,
    location: 'Media Store, Block A',
    availabilityWindow: 'Mon-Fri 09:00-17:00',
    status: 'OUT_OF_SERVICE',
  },
];

const smartCampusDb = db.getSiblingDB(dbName);
const collectionExists = smartCampusDb.getCollectionNames().includes(resourcesCollection);

if (!collectionExists) {
  smartCampusDb.createCollection(resourcesCollection, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'name', 'type', 'capacity', 'location', 'availabilityWindow', 'status'],
        properties: {
          _id: { bsonType: 'string', description: 'Must be a string ID used by Spring Data.' },
          name: { bsonType: 'string' },
          type: { enum: ['ROOM', 'LAB', 'EQUIPMENT'] },
          capacity: { bsonType: 'int', minimum: 0 },
          location: { bsonType: 'string' },
          availabilityWindow: { bsonType: 'string' },
          status: { enum: ['ACTIVE', 'OUT_OF_SERVICE'] },
        },
      },
    },
  });
}

smartCampusDb[resourcesCollection].createIndex({ name: 1 });
smartCampusDb[resourcesCollection].createIndex({ type: 1, status: 1 });
smartCampusDb[resourcesCollection].createIndex({ location: 1 });

for (const resource of resources) {
  smartCampusDb[resourcesCollection].updateOne(
    { _id: resource._id },
    { $set: resource },
    { upsert: true }
  );
}

print('Facilities database initialization complete.');
print(`Database: ${dbName}`);
print(`Collection: ${resourcesCollection}`);
print(`Upserted records: ${resources.length}`);
