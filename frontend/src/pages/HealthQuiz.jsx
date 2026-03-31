import React, { useState } from "react"
import {
    User, Ruler, Weight, Activity,
    ChevronRight, ChevronLeft,
    Heart, Cigarette, Users
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, Button, Input, Select, CheckboxOption, StepsBar } from "../components/UI"

const STEPS = ["Personal Info", "Body Metrics", "Lifestyle", "Health History"]

const HealthQuiz = ({ onSubmit }) => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [direction, setDirection] = useState(1)

    const [formData, setFormData] = useState({
        full_name: "",
        age: "",
        gender: "M",
        height: "",
        weight: "",

        activity_level: "moderate",
        sleep_hours: "7",
        stress_level: "medium",

        is_smoker: false,
        drinks_alcohol: false,

        has_heart_history: false,
        has_hypertension: false,
        has_diabetes_history: false,
        has_cholesterol: false,

        chest_pain: "none",
        shortness_breath: "none",
    })

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const goNext = () => { setDirection(1); nextStep() }
    const goPrev = () => { setDirection(-1); prevStep() }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleSubmit = async () => {
        if (!formData.age || !formData.height || !formData.weight) {
            alert("Please fill in all required fields.")
            return
        }
        setLoading(true)
        try {
            await onSubmit(formData)
        } finally {
            setLoading(false)
        }
    }

    const canProceed = () => {
        if (step === 1) return formData.full_name && formData.age
        if (step === 2) return formData.height && formData.weight
        return true
    }

    const stepVariants = {
        initial: (dir) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
        animate: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
    }

    const steps = [

        // STEP 1 - PERSONAL INFO
        {
            content: (
                <>
                    <Input
                        label="Full Name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        icon={User}
                        placeholder="Enter your full name"
                    />
                    <Input
                        label="Age"
                        name="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleChange}
                    />
                    <Select
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        icon={Users}
                    >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </Select>
                </>
            )
        },

        // STEP 2 - BODY METRICS
        {
            content: (
                <>
                    <Input
                        label="Height (cm)"
                        name="height"
                        type="number"
                        value={formData.height}
                        onChange={handleChange}
                        icon={Ruler}
                    />
                    <Input
                        label="Weight (kg)"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                        icon={Weight}
                    />

                    {formData.height && formData.weight && (
                        <div style={{ marginTop: 15 }}>
                            <strong>BMI: </strong>
                            {(Number(formData.weight) /
                                ((Number(formData.height) / 100) ** 2)).toFixed(1)}
                        </div>
                    )}
                </>
            )
        },

        // STEP 3 - LIFESTYLE
        {
            content: (
                <>
                    <Select
                        label="Activity Level"
                        name="activity_level"
                        value={formData.activity_level}
                        onChange={handleChange}
                        icon={Activity}
                    >
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Very Active</option>
                    </Select>

                    <Select
                        label="Average Sleep Hours"
                        name="sleep_hours"
                        value={formData.sleep_hours}
                        onChange={handleChange}
                    >
                        <option value="5">Less than 5</option>
                        <option value="6">5–6 hours</option>
                        <option value="7">7–8 hours</option>
                        <option value="9">More than 8</option>
                    </Select>

                    <Select
                        label="Stress Level"
                        name="stress_level"
                        value={formData.stress_level}
                        onChange={handleChange}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </Select>

                    <CheckboxOption
                        label="I am a smoker"
                        name="is_smoker"
                        icon={Cigarette}
                        checked={formData.is_smoker}
                        onChange={handleChange}
                    />

                    <CheckboxOption
                        label="I consume alcohol regularly"
                        name="drinks_alcohol"
                        icon={Activity}
                        checked={formData.drinks_alcohol}
                        onChange={handleChange}
                    />
                </>
            )
        },

        // STEP 4 - HEALTH HISTORY
        {
            content: (
                <>
                    <CheckboxOption
                        label="Family history of heart disease"
                        name="has_heart_history"
                        icon={Heart}
                        checked={formData.has_heart_history}
                        onChange={handleChange}
                    />

                    <CheckboxOption
                        label="I have hypertension"
                        name="has_hypertension"
                        checked={formData.has_hypertension}
                        onChange={handleChange}
                    />

                    <CheckboxOption
                        label="History of diabetes"
                        name="has_diabetes_history"
                        checked={formData.has_diabetes_history}
                        onChange={handleChange}
                    />

                    <CheckboxOption
                        label="High cholesterol diagnosed"
                        name="has_cholesterol"
                        checked={formData.has_cholesterol}
                        onChange={handleChange}
                    />

                    <Select
                        label="Chest Pain"
                        name="chest_pain"
                        value={formData.chest_pain}
                        onChange={handleChange}
                    >
                        <option value="none">None of these</option>
                        <option value="rare">Rare</option>
                        <option value="sometimes">Sometimes</option>
                        <option value="frequent">Frequent</option>
                    </Select>

                    <Select
                        label="Shortness of Breath"
                        name="shortness_breath"
                        value={formData.shortness_breath}
                        onChange={handleChange}
                    >
                        <option value="none">None of these</option>
                        <option value="rare">Rare</option>
                        <option value="sometimes">Sometimes</option>
                        <option value="frequent">Frequent</option>
                    </Select>
                </>
            )
        }
    ]

    return (
        <div className="page-sm">
            <StepsBar steps={STEPS} current={step} />
            <Card>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        <h2>{STEPS[step - 1]}</h2>
                        {steps[step - 1].content}
                    </motion.div>
                </AnimatePresence>

                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                    {step > 1 && (
                        <Button variant="secondary" onClick={goPrev}>
                            <ChevronLeft size={18} /> Back
                        </Button>
                    )}

                    {step < STEPS.length ? (
                        <Button onClick={goNext} disabled={!canProceed()}>
                            Next <ChevronRight size={18} />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Analyzing..." : "Analyze Health"}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default HealthQuiz