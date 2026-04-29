import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ──────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@ewastepedia.org" },
    update: {},
    create: {
      username: "admin",
      email: "admin@ewastepedia.org",
      passwordHash: await bcrypt.hash("changeme123", 12),
      role: "ADMIN",
      bio: "Site administrator",
    },
  });

  const repair_tom = await prisma.user.upsert({
    where: { email: "repair_tom@example.com" },
    update: {},
    create: {
      username: "repair_tom",
      email: "repair_tom@example.com",
      passwordHash: await bcrypt.hash("password123", 12),
      role: "MODERATOR",
    },
  });

  const maker_jay = await prisma.user.upsert({
    where: { email: "maker_jay@example.com" },
    update: {},
    create: {
      username: "maker_jay",
      email: "maker_jay@example.com",
      passwordHash: await bcrypt.hash("password123", 12),
    },
  });

  const circuit_linda = await prisma.user.upsert({
    where: { email: "circuit_linda@example.com" },
    update: {},
    create: {
      username: "circuit_linda",
      email: "circuit_linda@example.com",
      passwordHash: await bcrypt.hash("password123", 12),
    },
  });

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "power-energy" },
      update: {},
      create: {
        slug: "power-energy",
        name: "Power & Energy",
        description: "Batteries, capacitors, transformers, voltage regulators",
        iconEmoji: "⚡",
        tags: ["batteries", "capacitors", "transformers", "voltage regulators"],
        displayOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "wireless-comms" },
      update: {},
      create: {
        slug: "wireless-comms",
        name: "Wireless & Comms",
        description: "WiFi, Bluetooth, 4G modules, NFC, Zigbee",
        iconEmoji: "📡",
        tags: ["WiFi", "Bluetooth", "4G modules", "NFC", "Zigbee"],
        displayOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sensors" },
      update: {},
      create: {
        slug: "sensors",
        name: "Sensors",
        description: "Cameras, temperature, gyroscopes, IR, light sensors",
        iconEmoji: "📷",
        tags: ["cameras", "temperature", "gyroscopes", "IR", "light sensors"],
        displayOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "input-devices" },
      update: {},
      create: {
        slug: "input-devices",
        name: "Input Devices",
        description: "Buttons, encoders, touchscreens, trackpads, fingerprint",
        iconEmoji: "🖲️",
        tags: ["buttons", "encoders", "touchscreens", "trackpads"],
        displayOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "motors-actuators" },
      update: {},
      create: {
        slug: "motors-actuators",
        name: "Motors & Actuators",
        description: "Stepper motors, servo motors, fans, vibration motors",
        iconEmoji: "⚙️",
        tags: ["stepper motors", "servo motors", "fans", "vibration motors"],
        displayOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "connectors-cables" },
      update: {},
      create: {
        slug: "connectors-cables",
        name: "Connectors & Cables",
        description: "USB ports, ribbon cables, HDMI, FPC connectors",
        iconEmoji: "🔌",
        tags: ["USB ports", "ribbon cables", "HDMI", "FPC connectors"],
        displayOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: "audio-components" },
      update: {},
      create: {
        slug: "audio-components",
        name: "Audio Components",
        description: "Speakers, microphones, buzzers, audio amplifiers",
        iconEmoji: "🔊",
        tags: ["speakers", "microphones", "buzzers", "audio amplifiers"],
        displayOrder: 7,
      },
    }),
    prisma.category.upsert({
      where: { slug: "display-lighting" },
      update: {},
      create: {
        slug: "display-lighting",
        name: "Display & Lighting",
        description: "LCD screens, OLED panels, LED strips, backlight modules",
        iconEmoji: "💡",
        tags: ["LCD screens", "OLED panels", "LED strips"],
        displayOrder: 8,
      },
    }),
    prisma.category.upsert({
      where: { slug: "passive-components" },
      update: {},
      create: {
        slug: "passive-components",
        name: "Passive Components",
        description: "Resistors, inductors, diodes, transistors, crystals",
        iconEmoji: "🔩",
        tags: ["resistors", "inductors", "diodes", "transistors"],
        displayOrder: 9,
      },
    }),
  ]);

  const motorsCat = categories[4];

  // ── Components ──────────────────────────────────────────────────────────
  const motor28byj = await prisma.component.upsert({
    where: { slug: "28byj-48" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "28byj-48",
      name: "28BYJ-48",
      description: "5V unipolar stepper motor widely found in air conditioners, DVD drives, and security cameras.",
      specs: [
        { label: "Voltage", value: "5V DC" },
        { label: "Type", value: "Unipolar Stepper" },
        { label: "Step Angle", value: "5.625° / 64" },
        { label: "Gear Ratio", value: "1/64" },
        { label: "Phases", value: "4" },
        { label: "Resistance", value: "20–50Ω" },
        { label: "Weight", value: "28g" },
      ],
      tags: ["DIY", "EDUCATION", "stepper", "5V", "AC unit", "DVD drive"],
    },
  });

  const uln2003 = await prisma.component.upsert({
    where: { slug: "uln2003-driver" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "uln2003-driver",
      name: "ULN2003 Driver",
      description: "Darlington transistor array board, standard companion for 28BYJ-48 stepper motors.",
      specs: [
        { label: "IC", value: "ULN2003AN" },
        { label: "Channels", value: "7" },
        { label: "Max Current", value: "500mA per channel" },
        { label: "Voltage", value: "5–12V" },
      ],
      tags: ["DIY", "TEARDOWN", "driver", "darlington"],
    },
  });

  const nema17 = await prisma.component.upsert({
    where: { slug: "nema-17" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "nema-17",
      name: "NEMA 17",
      description: "Bipolar stepper motor salvaged from 3D printers and CNC machines. 12V, high torque.",
      specs: [
        { label: "Voltage", value: "12V DC" },
        { label: "Type", value: "Bipolar Stepper" },
        { label: "Step Angle", value: "1.8°" },
        { label: "Current", value: "1.2–2A" },
        { label: "Holding Torque", value: "~40 N·cm" },
      ],
      tags: ["COMMUNITY", "DOCS", "stepper", "12V", "3D printer"],
    },
  });

  await prisma.component.upsert({
    where: { slug: "sg90-servo" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "sg90-servo",
      name: "SG90 Servo",
      description: "9g micro servo, ubiquitous in RC toys, robotic arms, and pan-tilt camera mounts.",
      specs: [
        { label: "Voltage", value: "4.8–6V" },
        { label: "Torque", value: "1.8 kg·cm" },
        { label: "Speed", value: "0.1s / 60°" },
        { label: "Weight", value: "9g" },
      ],
      tags: ["DOCS", "DIY", "servo", "RC", "9g"],
    },
  });

  await prisma.component.upsert({
    where: { slug: "775-dc-motor" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "775-dc-motor",
      name: "775 DC Motor",
      description: "High-speed brushed DC motor salvaged from power tools, printers, and appliances.",
      specs: [
        { label: "Voltage", value: "12–24V" },
        { label: "No-load RPM", value: "3500–9000 RPM" },
        { label: "Shaft Diameter", value: "5mm" },
      ],
      tags: ["DIY", "COMMUNITY", "brushed", "12V", "power tool"],
    },
  });

  await prisma.component.upsert({
    where: { slug: "rs-380-motor" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "rs-380-motor",
      name: "RS-380 Motor",
      description: "Small brushed DC motor from slot cars, cassette decks, and toy vehicles.",
      specs: [
        { label: "Voltage", value: "1.5–6V" },
        { label: "No-load RPM", value: "8000 RPM @ 3V" },
        { label: "Weight", value: "35g" },
      ],
      tags: ["EDUCATION", "DOCS", "brushed", "3V", "toy"],
    },
  });

  await prisma.component.upsert({
    where: { slug: "n20-micro-motor" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "n20-micro-motor",
      name: "N20 Micro Motor",
      description: "Tiny geared DC motor used in robots, camera autofocus, and medical devices.",
      specs: [
        { label: "Voltage", value: "3–6V" },
        { label: "Gear Ratios", value: "10:1 – 1000:1" },
        { label: "Shaft Diameter", value: "3mm" },
        { label: "Size", value: "10 × 12mm" },
      ],
      tags: ["COMMUNITY", "TEARDOWN", "geared", "micro", "robot"],
    },
  });

  await prisma.component.upsert({
    where: { slug: "eg1218-motor" },
    update: {},
    create: {
      categoryId: motorsCat.id,
      slug: "eg1218-motor",
      name: "EG1218",
      description: "Pager vibration motor salvaged from mobile phones and handheld devices.",
      specs: [
        { label: "Voltage", value: "3V" },
        { label: "Current", value: "60–100mA" },
        { label: "Vibration", value: "13500 RPM" },
        { label: "Size", value: "12 × 3.4mm" },
      ],
      tags: ["DIY", "COMMUNITY", "vibration", "pager", "3V"],
    },
  });

  // ── Wiki page for 28BYJ-48 ───────────────────────────────────────────────
  await prisma.wikiPage.upsert({
    where: { componentId: motor28byj.id },
    update: {},
    create: {
      componentId: motor28byj.id,
      authorId: repair_tom.id,
      content: `## Overview

The **28BYJ-48** is a 5V unipolar stepper motor widely found in consumer electronics, particularly in air conditioning units, DVD drives, and security cameras. Its compact size and low power consumption make it ideal for salvage and reuse in DIY electronics projects.

This motor operates with a **ULN2003 Driver** board and requires minimal external components. Unlike larger industrial steppers like the **NEMA 17**, the 28BYJ-48 is geared (1:64 ratio), making it slow but surprisingly strong for its size.

## How It Works

The 28BYJ-48 is a **unipolar** stepper motor with 4 phases. The internal gear reduction of approximately 1:64 means the output shaft rotates once for every 64 revolutions of the motor's internal rotor. This gives it excellent torque at low speeds but limits its maximum RPM.

**Control sequence (half-step mode):**
\`\`\`
Step | IN1 | IN2 | IN3 | IN4
  1  |  1  |  0  |  0  |  0
  2  |  1  |  1  |  0  |  0
  3  |  0  |  1  |  0  |  0
  4  |  0  |  1  |  1  |  0
  5  |  0  |  0  |  1  |  0
  6  |  0  |  0  |  1  |  1
  7  |  0  |  0  |  0  |  1
  8  |  1  |  0  |  0  |  1
\`\`\`

## Where to Salvage

- **Air conditioners** — flap control motors, usually 2–4 per unit
- **DVD/Blu-ray drives** — disc tray mechanism
- **Security cameras** — pan/tilt mechanisms
- **Toy robots** — often in cheap educational kits

## Wiring with ULN2003

Connect the 5-pin connector directly to the ULN2003 driver board. The driver board has 4 input pins (IN1–IN4) that connect to any 4 digital GPIO pins on your microcontroller.

\`\`\`
Motor connector → ULN2003 board → Microcontroller
Orange → IN1 → GPIO pin
Yellow → IN2 → GPIO pin
Pink   → IN3 → GPIO pin
Blue   → IN4 → GPIO pin
Red    → 5V supply
\`\`\`

## Arduino Example

\`\`\`cpp
#include <Stepper.h>

const int stepsPerRevolution = 2048; // actual steps after gear ratio
Stepper myStepper(stepsPerRevolution, 8, 10, 9, 11);

void setup() {
  myStepper.setSpeed(10); // RPM
}

void loop() {
  myStepper.step(stepsPerRevolution);  // one full rotation
  delay(1000);
  myStepper.step(-stepsPerRevolution); // reverse
  delay(1000);
}
\`\`\`

## Salvage Tips

- **Desoldering**: The motor has a 5-pin JST connector, making it trivially easy to remove. No desoldering required if the full PCB is available.
- **Testing**: Apply 5V and pulse the coils manually using a 9V battery and brief touches to each pin pair.
- **Condition check**: Listen for grinding or uneven stepping which indicates worn gears.

## Common Project Ideas

- Mini turntable / photography rotator
- Clock mechanism (with position feedback)
- Small robotic arm joint
- Automated plant watering angle control
- Vinyl record player slow rotation
`,
    },
  });

  // ── Forum post ───────────────────────────────────────────────────────────
  const post = await prisma.post.upsert({
    where: { id: "seed-post-motor-1" },
    update: {},
    create: {
      id: "seed-post-motor-1",
      categoryId: motorsCat.id,
      authorId: maker_jay.id,
      title: "How to reuse 28BYJ-48 from old air conditioners?",
      body: "I salvaged a bunch of these stepper motors from broken AC units. The 28BYJ-48 runs at 5V with a 64-step sequence and decent torque for light loads. Looking for project ideas and wiring tips — especially if anyone has paired it with a driver board salvaged from e-waste too. Any datasheets or teardown guides welcome!",
      tags: ["DIY"],
      voteScore: 248,
      viewCount: 1423,
    },
  });

  // Link referenced components
  await prisma.postComponent.upsert({
    where: { postId_componentId: { postId: post.id, componentId: motor28byj.id } },
    update: {},
    create: { postId: post.id, componentId: motor28byj.id },
  });

  // ── Comments ─────────────────────────────────────────────────────────────
  const c1 = await prisma.comment.upsert({
    where: { id: "seed-comment-1" },
    update: {},
    create: {
      id: "seed-comment-1",
      postId: post.id,
      authorId: circuit_linda.id,
      body: "I used mine for a mini turntable project! Paired the 28BYJ-48 with a salvaged ULN2003 Driver board — works perfectly at 5V. The driver board is super common in old printer circuits, worth checking those out.",
      voteScore: 184,
    },
  });

  const c1r1 = await prisma.comment.upsert({
    where: { id: "seed-comment-1r1" },
    update: {},
    create: {
      id: "seed-comment-1r1",
      postId: post.id,
      parentId: c1.id,
      authorId: maker_jay.id,
      body: "This is exactly what I needed — where do you usually find the ULN2003 Driver in printers? Front panel PCBs or closer to the motor assembly?",
      voteScore: 67,
      isOp: true,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-1r1r1" },
    update: {},
    create: {
      id: "seed-comment-1r1r1",
      postId: post.id,
      parentId: c1r1.id,
      authorId: circuit_linda.id,
      body: "Usually near the motor assembly — look for the small daughterboard with the 4 LEDs. It's almost always a ULN2003 Driver clone. Takes 5 minutes to desolder cleanly.",
      voteScore: 41,
    },
  });

  const c2 = await prisma.comment.upsert({
    where: { id: "seed-comment-2" },
    update: {},
    create: {
      id: "seed-comment-2",
      postId: post.id,
      authorId: repair_tom.id,
      body: "Check the 28BYJ-48 wiki page here on E-Wastepedia — someone uploaded the full datasheet and a wiring diagram last week. Also comparing it with the NEMA 17: very different torque profiles. The BYJ is geared (1/64 ratio) so slow but strong for its size.",
      voteScore: 112,
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-2r1" },
    update: {},
    create: {
      id: "seed-comment-2r1",
      postId: post.id,
      parentId: c2.id,
      authorId: admin.id,
      body: "Right — the NEMA 17 needs 12V and a dedicated driver like an A4988 Stepper Driver. Not worth it unless you're doing something that actually needs the torque. For light loads the 28BYJ-48 + ULN2003 Driver combo is unbeatable for e-waste builds.",
      voteScore: 29,
    },
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
