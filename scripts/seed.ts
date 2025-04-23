import { db } from "@/db"
import { specializations as specializationSchema } from "@/db/schema"
// seed doctor specializations like neurologist, cardiologist, etc
const seedDoctorSpecializations = async () => {
    const specializations = [
        "Cardiologist",
        "Dermatologist",
        "Endocrinologist",
        "Gastroenterologist",
        "Hematologist",
        "Nephrologist",
        "Neurologist",
        "Oncologist",
        "Ophthalmologist",
        "Otolaryngologist",
        "Pediatrician",
        "Pulmonologist",
        "Rheumatologist",
        "Urologist",
    ]

    for (const specialization of specializations) {
        await db.insert(specializationSchema).values({
            name: specialization,
            description: `The ${specialization} is a medical doctor who specializes in the diagnosis and treatment of diseases and disorders of the heart and blood vessels.`
        })
    }
}
function main() {
    console.log(`Seeding doctor specializations...`)
    seedDoctorSpecializations()
    console.log(`Doctor specializations seeded successfully!`)
}
main();