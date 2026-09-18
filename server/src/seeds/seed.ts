import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Enquiry } from '../models/Enquiry';
import { Visit } from '../models/Visit';
import { Favourite } from '../models/Favourite';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 0. Ensure Hardik Admin account always exists with exact credentials:
    // ID: hardik, Password: hardik, Role: ADMIN
    const hardikSalt = await bcrypt.genSalt(10);
    const hardikPasswordHash = await bcrypt.hash('hardik', hardikSalt);

    const existingHardik = await User.findOne({ email: 'hardik' });
    if (!existingHardik) {
      await User.create({
        name: 'Hardik Mokariya',
        email: 'hardik',
        phone: '+91 8140115245',
        passwordHash: hardikPasswordHash,
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      });
      console.log('[Seed] Admin account "hardik" initialized with password "hardik".');
    } else {
      existingHardik.name = 'Hardik Mokariya';
      existingHardik.passwordHash = hardikPasswordHash;
      existingHardik.role = 'ADMIN';
      existingHardik.accountStatus = 'ACTIVE';
      await existingHardik.save();
      console.log('[Seed] Admin account "hardik" verified and updated.');
    }

    const userCount = await User.countDocuments();
    if (userCount > 1) {
      console.log('[Seed] Database already contains data. Skipping automatic seed.');
      return;
    }

    console.log('[Seed] Seeding initial demo data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Demo Users for each Role
    const tenantUser = await User.create({
      name: 'Aarav Sharma (Tenant)',
      email: 'tenant@smartrent.com',
      phone: '+91 98201 11223',
      passwordHash,
      role: 'TENANT',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      preferences: {
        budgetMax: 60000,
        preferredCity: 'Mumbai',
        preferredType: 'apartment',
      },
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });

    const ownerUser = await User.create({
      name: 'Rajesh Singhania (Owner)',
      email: 'owner@smartrent.com',
      phone: '+91 98330 44556',
      passwordHash,
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });

    const agentUser = await User.create({
      name: 'Priya Deshmukh (Agent)',
      email: 'agent@smartrent.com',
      phone: '+91 98450 77889',
      passwordHash,
      role: 'AGENT',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });

    const adminUser = await User.create({
      name: 'Admin Supervisor',
      email: 'admin@smartrent.com',
      phone: '+91 98110 99000',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });

    // 2. Create Real-World Seed Properties
    const propertiesData = [
      {
        title: 'Luxury Sea-Facing 3BHK in Bandra West',
        description: 'Spectacular panoramic Arabian Sea views, Italian marble flooring, designer kitchen, and private parking. Walkable distance to Carter Road promenade.',
        owner: ownerUser._id,
        propertyType: 'apartment',
        rent: 95000,
        securityDeposit: 250000,
        bedrooms: 3,
        bathrooms: 3,
        area: 1650,
        amenities: ['Sea View', 'Gym', 'Swimming Pool', 'Covered Parking', '24/7 Security', 'Elevator', 'Air Conditioning'],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
        ],
        address: '14 Carter Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [72.8258, 19.0607], // [lng, lat] Bandra
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
      {
        title: 'Modern High-Rise 2BHK in Hiranandani Powai',
        description: 'Elegantly furnished 2 bedroom home in scenic Hiranandani Gardens. Features club access, jogging track, piped gas, and high speed elevators.',
        owner: ownerUser._id,
        propertyType: 'apartment',
        rent: 62000,
        securityDeposit: 150000,
        bedrooms: 2,
        bathrooms: 2,
        area: 980,
        amenities: ['Clubhouse', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Play Area'],
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
        ],
        address: 'Central Avenue, Hiranandani Gardens, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [72.9090, 19.1176], // Powai
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
      {
        title: 'Cozy Studio Apartment in Indiranagar',
        description: 'Prime location off 100 Feet Road, walking distance to metro, cafes, and tech hubs. Fully furnished with modular kitchenette and high-speed fiber internet.',
        owner: agentUser._id,
        propertyType: 'studio',
        rent: 28000,
        securityDeposit: 60000,
        bedrooms: 1,
        bathrooms: 1,
        area: 520,
        amenities: ['High Speed WiFi', 'Furnished', 'Balcony', 'Security', 'Bike Parking'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
        ],
        address: '12th Main Road, HAL 2nd Stage, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [77.6412, 12.9784], // Indiranagar, Bangalore
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
      {
        title: 'Spacious 4BHK Independent Villa with Garden',
        description: 'Expansive private duplex villa in gated green community. Private lawn, solar water heating, servant quarters, and double covered garage.',
        owner: ownerUser._id,
        propertyType: 'villa',
        rent: 110000,
        securityDeposit: 300000,
        bedrooms: 4,
        bathrooms: 4,
        area: 3200,
        amenities: ['Private Garden', 'Gated Community', 'Covered Parking', 'Solar Power', 'Security', 'Pet Friendly'],
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
        ],
        address: 'Green Meadows, Sarjapur Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [77.6974, 12.9249], // Sarjapur Road
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
      {
        title: 'Contemporary 3BHK Apartment in Koregaon Park',
        description: 'Vibrant residential pocket near Osho Garden. Beautifully ventilated corner unit with large wrap-around balcony, wooden flooring, and 2 car parkings.',
        owner: agentUser._id,
        propertyType: 'apartment',
        rent: 55000,
        securityDeposit: 140000,
        bedrooms: 3,
        bathrooms: 3,
        area: 1420,
        amenities: ['Balcony', 'Gym', 'Covered Parking', 'Elevator', '24/7 Security'],
        images: [
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&auto=format&fit=crop&q=80',
        ],
        address: 'Lane 7, Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [73.8966, 18.5362], // Koregaon Park
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
      {
        title: 'Charming 2BHK Independent House in Vasant Kunj',
        description: 'Peaceful ground floor independent house with front porch and quiet neighborhood park view. Ample natural sunlight and wide driveway.',
        owner: ownerUser._id,
        propertyType: 'house',
        rent: 42000,
        securityDeposit: 90000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        amenities: ['Front Garden', 'Park Facing', 'Water Storage', 'Security'],
        images: [
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&auto=format&fit=crop&q=80',
        ],
        address: 'Sector B, Pocket 8, Vasant Kunj',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        location: {
          type: 'Point',
          coordinates: [77.1565, 28.5284], // Vasant Kunj
        },
        verificationStatus: 'APPROVED',
        listingStatus: 'ACTIVE',
      },
    ];

    const createdProperties = await Property.insertMany(propertiesData);

    // 3. Seed Favourite
    await Favourite.create({
      user: tenantUser._id,
      property: createdProperties[0]._id,
    });

    // 4. Seed Enquiry
    await Enquiry.create({
      tenant: tenantUser._id,
      property: createdProperties[0]._id,
      ownerAgent: ownerUser._id,
      message: 'Hello, I am very interested in this sea-facing Bandra apartment. Is it available for immediate move-in?',
      phone: '+91 98201 11223',
      status: 'PENDING',
    });

    // 5. Seed Visit
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + 3);
    await Visit.create({
      tenant: tenantUser._id,
      property: createdProperties[1]._id,
      ownerAgent: ownerUser._id,
      requestedDate: visitDate,
      requestedTime: '11:30 AM',
      status: 'CONFIRMED',
      message: 'Would love to inspect the clubhouse and parking space during the visit.',
    });

    console.log('[Seed] Demo database seeding completed successfully!');
    console.log(`[Seed] Created 4 users, ${createdProperties.length} properties, 1 favourite, 1 enquiry, 1 visit.`);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
  }
};
