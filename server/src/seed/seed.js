const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');

const seedData = async (options = {}) => {
    const { forceClean = false } = options;
    try {
        console.log('[CivicPulse Seed] Connecting to database...');
        await connectDB();

        if (forceClean) {
            console.log('[CivicPulse Seed] Clearing existing database collections (--clean requested)...');
            await User.deleteMany({});
            await Issue.deleteMany({});
        }

        // 1. Create or update Admin Account
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicpulse.org').toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: 'Municipal Commissioner (Admin)',
                email: adminEmail,
                passwordHash: adminPasswordHash,
                role: 'admin',
            });
            console.log(`[CivicPulse Seed] Created 1 Admin: ${admin.email}`);
        } else {
            admin.name = 'Municipal Commissioner (Admin)';
            admin.passwordHash = adminPasswordHash;
            admin.role = 'admin';
            await admin.save();
            console.log(`[CivicPulse Seed] Verified/Updated Admin: ${admin.email}`);
        }

        // 2. Create or update 3 Sample Citizen Accounts
        const defaultCitizenPassword = await bcrypt.hash('password123', 10);
        const citizenDefs = [
            { name: 'Aarav Sharma', email: 'aarav@example.com' },
            { name: 'Priya Venkatesh', email: 'priya@example.com' },
            { name: 'Rohan Deshmukh', email: 'rohan@example.com' }
        ];

        const citizens = [];
        for (const cDef of citizenDefs) {
            let cit = await User.findOne({ email: cDef.email });
            if (!cit) {
                cit = await User.create({
                    name: cDef.name,
                    email: cDef.email,
                    passwordHash: defaultCitizenPassword,
                    role: 'citizen',
                });
                console.log(`[CivicPulse Seed] Created Citizen: ${cit.email}`);
            } else {
                cit.passwordHash = defaultCitizenPassword;
                cit.role = 'citizen';
                await cit.save();
                console.log(`[CivicPulse Seed] Verified/Updated Citizen: ${cit.email}`);
            }
            citizens.push(cit);
        }

        const allUsers = [admin, ...citizens];

        // Helper for GeoJSON: [longitude, latitude]
        // Bengaluru coordinates: latitude ~12.97, longitude ~77.59
        const bengaluruIssues = [
            {
                title: 'Deep crater pothole near Indiranagar 100ft Road junction',
                description: 'Vehicles are having to suddenly brake or swerve onto oncoming traffic. Several two-wheelers have skid during rainfall.',
                category: 'pothole',
                status: 'open',
                coords: [77.6408, 12.9784], // Indiranagar
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Issue reported by citizen via mobile GPS', updater: citizens[0], offsetDays: 5 }
                ],
                upvoters: [citizens[1], citizens[2]]
            },
            {
                title: 'Non-functional streetlights along Koramangala 4th Block park',
                description: 'Complete stretch of 6 sodium lamps has been unlit for 10 days, making the evening sidewalk unsafe for pedestrians.',
                category: 'streetlight',
                status: 'in_progress',
                coords: [77.6245, 12.9352], // Koramangala
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Reported by resident association', updater: citizens[1], offsetDays: 7 },
                    { status: 'in_progress', comment: 'BESCOM line maintenance team scheduled for underground cable inspection.', updater: admin, offsetDays: 2 }
                ],
                upvoters: [citizens[0], citizens[2], admin]
            },
            {
                title: 'Overflowing commercial waste dump near MG Road Metro Station',
                description: 'Garbage bins have been completely overturned with waste spilling across half the pedestrian walkway.',
                category: 'garbage',
                status: 'resolved',
                coords: [77.6094, 12.9756], // MG Road
                imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Complained about foul odor and footpath blocking', updater: citizens[2], offsetDays: 10 },
                    { status: 'in_progress', comment: 'BBMP solid waste disposal compactor dispatched.', updater: admin, offsetDays: 8 },
                    { status: 'resolved', comment: 'Area cleared, sanitized with bleaching powder, and new covered bins installed.', updater: admin, offsetDays: 3 }
                ],
                upvoters: [citizens[0], citizens[1]]
            },
            {
                title: 'High-pressure water main pipeline leak on HSR Layout 27th Main',
                description: 'Clean drinking water has been gushing onto the road since early morning, flooding the basement of adjacent commercial complexes.',
                category: 'water_leak',
                status: 'in_progress',
                coords: [77.6446, 12.9121], // HSR Layout
                imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Water leak reported with photo evidence', updater: citizens[0], offsetDays: 3 },
                    { status: 'in_progress', comment: 'BWSSB emergency valve team closed feeder line; replacement coupling under installation.', updater: admin, offsetDays: 1 }
                ],
                upvoters: [citizens[1], citizens[2], admin]
            },
            {
                title: 'Damaged median divider blocks bus lane on Whitefield Main Road',
                description: 'Concrete road divider broken and knocked into the right-hand lane following an overnight collision.',
                category: 'road_damage',
                status: 'open',
                coords: [77.7500, 12.9698], // Whitefield
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Divider concrete blocks obstructing traffic flow', updater: citizens[1], offsetDays: 2 }
                ],
                upvoters: [citizens[0]]
            },
            {
                title: 'Open sewer manhole without safety barricade near Malleshwaram 8th Cross',
                description: 'Cast iron cover is missing completely. High hazard for school children and evening pedestrians in heavy footfall zone.',
                category: 'other',
                status: 'resolved',
                coords: [77.5643, 13.0031], // Malleshwaram
                imageUrl: '',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Urgent citizen safety hazard flagged', updater: citizens[2], offsetDays: 6 },
                    { status: 'in_progress', comment: 'Temporary wooden warning barricade placed immediately.', updater: admin, offsetDays: 5 },
                    { status: 'resolved', comment: 'Heavy-duty ductile iron frame and cover installed and leveled with road surface.', updater: admin, offsetDays: 1 }
                ],
                upvoters: [citizens[0], citizens[1], citizens[2]]
            },
            {
                title: 'Multiple contiguous potholes outside Jayanagar 4th Block BDA Complex',
                description: 'Road surface completely disintegrated across 30 meters. Auto-rickshaws refusing to take passengers on this stretch.',
                category: 'pothole',
                status: 'open',
                coords: [77.5838, 12.9308], // Jayanagar
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Pothole cluster reported by commuter', updater: citizens[0], offsetDays: 4 }
                ],
                upvoters: [citizens[1]]
            },
            {
                title: 'Damaged street lighting pole tilting precariously in Hebbal',
                description: 'Steel streetlight pole leaning at 30 degrees after truck brushed against overhead cables. Needs stabilization immediately.',
                category: 'streetlight',
                status: 'in_progress',
                coords: [77.5970, 13.0358], // Hebbal
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Hazardous tilting pole reported', updater: citizens[1], offsetDays: 4 },
                    { status: 'in_progress', comment: 'Crane deployed to secure pole; foundation re-concreting underway.', updater: admin, offsetDays: 1 }
                ],
                upvoters: [citizens[0], citizens[2]]
            },
            {
                title: 'Plastic and construction debris dumped along Electronic City Phase 1 access road',
                description: 'Tractor loads of debris being dumped illegally after midnight along the service corridor.',
                category: 'garbage',
                status: 'open',
                coords: [77.6602, 12.8452], // Electronic City
                imageUrl: '',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Reported illegal debris dumping site', updater: citizens[2], offsetDays: 1 }
                ],
                upvoters: [citizens[0]]
            },
            {
                title: 'Continuous potable water pipeline seepage outside Commercial Street shopping area',
                description: 'Under-pavement leakage eroding brick footpath and creating slimy algae patches where shoppers walk.',
                category: 'water_leak',
                status: 'resolved',
                coords: [77.6083, 12.9822], // Commercial Street
                imageUrl: '',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Footpath algae hazard from pipe seepage', updater: citizens[0], offsetDays: 12 },
                    { status: 'in_progress', comment: 'Pavement tiles lifted to patch copper pipe joint.', updater: admin, offsetDays: 10 },
                    { status: 'resolved', comment: 'Joint welded, tested at full pressure, and pavement tiles restored.', updater: admin, offsetDays: 4 }
                ],
                upvoters: [citizens[1], citizens[2]]
            },
            {
                title: 'Severe asphalt subsidence and road cracking on Rajajinagar 1st Block',
                description: 'Road collapsed inward by 6 inches over an old storm drain crossing. Risk of cave-in.',
                category: 'road_damage',
                status: 'in_progress',
                coords: [77.5530, 12.9982], // Rajajinagar
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Road subsidence reported by resident', updater: citizens[1], offsetDays: 5 },
                    { status: 'in_progress', comment: 'Structural civil engineers assessing culvert integrity.', updater: admin, offsetDays: 2 }
                ],
                upvoters: [citizens[0], citizens[2]]
            },
            {
                title: 'Footpath paving slabs broken and missing outside BTM Layout Water Tank',
                description: 'Pedestrians forced into busy traffic lane due to completely missing sidewalk tiles for 50 meters.',
                category: 'other',
                status: 'open',
                coords: [77.6101, 12.9166], // BTM Layout
                imageUrl: '',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Missing walkway slabs reported', updater: citizens[2], offsetDays: 2 }
                ],
                upvoters: [citizens[1]]
            },
            {
                title: 'Large asphalt crater on Bellandur Outer Ring Road near ecospace flyover',
                description: 'Deep trench-like pothole directly on the vehicular path after monsoon rains.',
                category: 'pothole',
                status: 'resolved',
                coords: [77.6762, 12.9260], // Bellandur
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Major bottleneck pothole on ORR', updater: citizens[0], offsetDays: 14 },
                    { status: 'in_progress', comment: 'Milling machine and hot mix asphalt scheduled for night shift.', updater: admin, offsetDays: 11 },
                    { status: 'resolved', comment: 'Surface milled, filled with dense bituminous macadam, and rolled flush.', updater: admin, offsetDays: 6 }
                ],
                upvoters: [citizens[1], citizens[2], admin]
            },
            {
                title: 'Flickering LED streetlights on Marathahalli Bridge junction',
                description: 'Strobe-like flickering of high-mast lamp distracting nighttime drivers approaching the bridge ramp.',
                category: 'streetlight',
                status: 'open',
                coords: [77.6974, 12.9591], // Marathahalli
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'High mast flickering reported', updater: citizens[1], offsetDays: 3 }
                ],
                upvoters: [citizens[0]]
            },
            {
                title: 'Secondary waste accumulation behind Shivajinagar Russell Market',
                description: 'Organic vegetable waste accumulating near alleyway entrance, creating severe pest infestation.',
                category: 'garbage',
                status: 'in_progress',
                coords: [77.6047, 12.9863], // Shivajinagar
                imageUrl: '',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Market waste dump reported', updater: citizens[2], offsetDays: 4 },
                    { status: 'in_progress', comment: 'Additional 3 bins allocated; special nightly collection route scheduled.', updater: admin, offsetDays: 1 }
                ],
                upvoters: [citizens[0], citizens[1]]
            },
            {
                title: 'Stormwater drain overflowing onto Richmond Road during normal shower',
                description: 'Silt accumulation in culvert causing road surface to flood with knee-deep water.',
                category: 'water_leak',
                status: 'open',
                coords: [77.6031, 12.9632], // Richmond Town
                imageUrl: '',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Drain silt blockage reported', updater: citizens[0], offsetDays: 2 }
                ],
                upvoters: [citizens[2]]
            },
            {
                title: 'Speed breaker unpainted and damaged on Basavanagudi DVG Road',
                description: 'Invisible at night due to faded white paint; bottoming out low clearance vehicles.',
                category: 'road_damage',
                status: 'resolved',
                coords: [77.5753, 12.9422], // Basavanagudi
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Unmarked speed breaker reported', updater: citizens[1], offsetDays: 16 },
                    { status: 'in_progress', comment: 'Traffic police clearance obtained for repainting work.', updater: admin, offsetDays: 13 },
                    { status: 'resolved', comment: 'Thermoplastic reflective zebra stripes painted with warning signboards.', updater: admin, offsetDays: 8 }
                ],
                upvoters: [citizens[0], citizens[2]]
            },
            {
                title: 'Fallen tree bough blocking half lane near Yeshwanthpur Railway Station',
                description: 'Heavy rain brought down large branch; partially blocking traffic right opposite auto stand.',
                category: 'other',
                status: 'resolved',
                coords: [77.5529, 13.0238], // Yeshwanthpur
                imageUrl: '',
                creator: citizens[2],
                history: [
                    { status: 'open', comment: 'Fallen tree branch reported', updater: citizens[2], offsetDays: 5 },
                    { status: 'in_progress', comment: 'Forest cell chainsaw unit dispatched to clear obstruction.', updater: admin, offsetDays: 4 },
                    { status: 'resolved', comment: 'Branch sectioned, hauled away to compost facility; lane cleared.', updater: admin, offsetDays: 3 }
                ],
                upvoters: [citizens[0], citizens[1]]
            },
            {
                title: 'Severe road surface pitting on Frazer Town Mosque Road',
                description: 'Irregular loose gravel and deep pitting causing two-wheeler tires to slip on turn.',
                category: 'pothole',
                status: 'in_progress',
                coords: [77.6139, 12.9988], // Frazer Town
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                creator: citizens[0],
                history: [
                    { status: 'open', comment: 'Road pitting and gravel hazard reported', updater: citizens[0], offsetDays: 6 },
                    { status: 'in_progress', comment: 'Cold mix patch application underway during non-peak traffic.', updater: admin, offsetDays: 2 }
                ],
                upvoters: [citizens[1], citizens[2]]
            },
            {
                title: 'Traffic signal light outage at Domlur Intermediate Ring Road junction',
                description: 'Pedestrian and vehicular signal cycling erratic with red indicator bulb blown out.',
                category: 'streetlight',
                status: 'open',
                coords: [77.6387, 12.9609], // Domlur
                imageUrl: '',
                creator: citizens[1],
                history: [
                    { status: 'open', comment: 'Traffic light outage reported by resident', updater: citizens[1], offsetDays: 1 }
                ],
                upvoters: [citizens[0], citizens[2]]
            }
        ];

        const existingIssuesCount = await Issue.countDocuments();
        if (existingIssuesCount < 5 || forceClean) {
            console.log(`[CivicPulse Seed] Seeding realistic Bengaluru civic issues...`);

            const now = Date.now();
            for (const item of bengaluruIssues) {
                const existing = await Issue.findOne({ title: item.title });
                if (existing) continue;

                // Map history entries with timestamps
                const statusHistory = item.history.map((h) => ({
                    status: h.status,
                    comment: h.comment,
                    updatedBy: h.updater._id,
                    date: new Date(now - (h.offsetDays || 1) * 24 * 60 * 60 * 1000)
                }));

                // Upvotes array of user ObjectIds
                const upvotes = (item.upvoters || []).map((u) => u._id);

                await Issue.create({
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    imageUrl: item.imageUrl || '',
                    location: {
                        type: 'Point',
                        coordinates: item.coords // [lng, lat]
                    },
                    status: item.status,
                    createdBy: item.creator._id,
                    upvotes,
                    statusHistory,
                    createdAt: new Date(now - (item.history[0]?.offsetDays || 1) * 24 * 60 * 60 * 1000)
                });
            }
            console.log(`[CivicPulse Seed] Seeded realistic Bengaluru civic reports.`);
        } else {
            console.log(`[CivicPulse Seed] Database already contains ${existingIssuesCount} issues. Keeping existing issue dataset.`);
        }

        console.log('[CivicPulse Seed] Demo data check complete.');
        return { admin, citizens };
    } catch (error) {
        console.error(`[CivicPulse Seed] Error running seed script: ${error.message}`);
        throw error;
    }
};

if (require.main === module) {
    const forceClean = process.argv.includes('--clean');
    seedData({ forceClean })
        .then(() => {
            console.log('[CivicPulse Seed] Standalone seed run finished.');
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = seedData;
