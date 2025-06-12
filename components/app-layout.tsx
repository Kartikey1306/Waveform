"use client"

import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { OrbitControls, useTexture, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, Zap, Activity, Radio, Download, Book, Cpu, Home, Settings, User, HelpCircle, Info, MessageSquare, Globe } from 'lucide-react'
import Image from 'next/image'

extend({ OrbitControls })

const Earth = () => {
  const earthTexture = useTexture('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ggCYCZPYXcHbaZ3zsAdkmZIniOepsl.png')

  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={earthTexture} />
    </mesh>
  )
}

const Satellite = ({ orbitRadius, orbitSpeed, initialAngle }) => {
  const satelliteRef = useRef()
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (groupRef.current && satelliteRef.current) {
      groupRef.current.rotation.y += delta * orbitSpeed
      satelliteRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} rotation={[0, initialAngle, 0]}>
      <group position={[orbitRadius, 0, 0]}>
        <group ref={satelliteRef}>
          <mesh>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.01]} />
            <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.01]} />
            <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

const OrbitTrail = ({ radius, color }) => {
  const points = []
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.5} />
    </line>
  )
}

const SatelliteSystem = () => {
  return (
    <group>
      <Earth />
      <OrbitTrail radius={2} color="#ff4444" />
      <OrbitTrail radius={2.5} color="#44ff44" />
      <OrbitTrail radius={3} color="#4444ff" />
      <Satellite orbitRadius={2} orbitSpeed={0.2} initialAngle={0} />
      <Satellite orbitRadius={2.5} orbitSpeed={0.15} initialAngle={Math.PI * 2 / 3} />
      <Satellite orbitRadius={3} orbitSpeed={0.1} initialAngle={Math.PI * 4 / 3} />
    </group>
  )
}

const DataTraffic = () => {
  const { scene } = useThree()
  const [dataStreams, setDataStreams] = useState([])

  useEffect(() => {
    const newDataStreams = []
    for (let i = 0; i < 20; i++) {
      const from = new THREE.Vector3().setFromSpherical(
        new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
      )
      const to = new THREE.Vector3().setFromSpherical(
        new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
      )
      newDataStreams.push({ from, to, progress: 0, speed: 0.005 + Math.random() * 0.01 })
    }
    setDataStreams(newDataStreams)
  }, [])

  useFrame(() => {
    setDataStreams(prevStreams =>
      prevStreams.map(stream => {
        const newProgress = stream.progress + stream.speed
        if (newProgress > 1) {
          const from = new THREE.Vector3().setFromSpherical(
            new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
          )
          const to = new THREE.Vector3().setFromSpherical(
            new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
          )
          return { from, to, progress: 0, speed: 0.005 + Math.random() * 0.01 }
        }
        return { ...stream, progress: newProgress }
      })
    )
  })

  return (
    <>
      {dataStreams.map((stream, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attachObject={['attributes', 'position']}
              count={2}
              array={new Float32Array([
                ...stream.from.toArray(),
                ...stream.to.toArray()
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ffff" opacity={0.5} transparent />
        </line>
      ))}
    </>
  )
}

const Scene3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <SatelliteSystem />
      <DataTraffic />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls />
    </Canvas>
  )
}

function HomePage() {
  const [waveformsDetected, setWaveformsDetected] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformsDetected(prev => prev + Math.floor(Math.random() * 5))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to DVB-S2X AMR</h1>
          <p className="text-xl mb-6">
            Explore the future of satellite communications with our cutting-edge
            DVB-S2X Automatic Modulation Recognition system.
          </p>
          <div className="flex space-x-4">
            <Button size="lg" onClick={() => console.log("Generate Waveforms")}>
              Generate Waveforms
            </Button>
            <Button size="lg" variant="outline" onClick={() => console.log("Detect Modulation")}>
              Detect Modulation
            </Button>
          </div>
        </div>
        <div className="h-[400px]">
          <Scene3D />
        </div>
      </div>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-2">Real-Time Stats</h2>
        <p className="text-2xl">{waveformsDetected} waveforms detected today</p>
      </motion.div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Explore DVB-S2X AMR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waveform Generation</CardTitle>
              <CardDescription>Create custom DVB-S2X waveforms</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Experiment with different modulation schemes, roll-off factors, and coding rates.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Try Now</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Modulation Recognition</CardTitle>
              <CardDescription>AI-powered signal detection</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Upload signals or use pre-set waveforms to test our advanced AMR system.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Detect Now</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Simulation Lab</CardTitle>
              <CardDescription>Test in various environments</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Simulate different conditions and analyze performance in real-time.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Simulation</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function WaveformGenerationPage() {
  const [modulation, setModulation] = useState('QPSK')
  const [rollOff, setRollOff] = useState(0.35)
  const [codingRate, setCodingRate] = useState(0.5)
  const [snr, setSnr] = useState(20)
  const [waveformData, setWaveformData] = useState([])

  useEffect(() => {
    generateWaveform()
  }, [modulation, rollOff, codingRate, snr])

  const generateWaveform = () => {
    const newData = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      amplitude: Math.sin(i * 0.1 * rollOff) + (Math.random() - 0.5) * (20 / snr)
    }))
    setWaveformData(newData)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">DVB-S2X Waveform Generation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Waveform Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">Modulation Scheme</label>
              <Select value={modulation} onValueChange={setModulation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select modulation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QPSK">QPSK</SelectItem>
                  <SelectItem value="8PSK">8PSK</SelectItem>
                  <SelectItem value="16APSK">16APSK</SelectItem>
                  <SelectItem value="32APSK">32APSK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Roll-off Factor: {rollOff.toFixed(2)}</label>
              <Slider
                min={0.05}
                max={0.5}
                step={0.01}
                value={[rollOff]}
                onValueChange={(value) => setRollOff(value[0])}
              />
            </div>
            <div>
              <label className="block mb-2">Coding Rate: {codingRate.toFixed(2)}</label>
              <Slider
                min={0.1}
                max={0.9}
                step={0.1}
                value={[codingRate]}
                onValueChange={(value) => setCodingRate(value[0])}
              />
            </div>
            <div>
              <label className="block mb-2">SNR (dB): {snr}</label>
              <Slider
                min={0}
                max={40}
                step={1}
                value={[snr]}
                onValueChange={(value) => setSnr(value[0])}
              />
            </div>
            <Button onClick={generateWaveform} className="w-full">Generate Waveform</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Waveform Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={waveformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amplitude" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Constellation Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="In-phase" />
                <YAxis type="number" dataKey="y" name="Quadrature" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Constellation" data={generateConstellationData(modulation)} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AMRPage() {
  const [selectedWaveform, setSelectedWaveform] = useState('QPSK')
  const [detectedModulation, setDetectedModulation] = useState(null)
  const [confidenceLevel, setConfidenceLevel] = useState(null)

  const runAMR = () => {
    setTimeout(() => {
      setDetectedModulation(selectedWaveform)
      setConfidenceLevel(Math.random() * 20 + 80)
    }, 1000)
  }

  const performanceData = [
    { name: 'SNR 0dB', AI: 85, Traditional: 70 },
    { name: 'SNR 5dB', AI: 90, Traditional: 80 },
    { name: 'SNR 10dB', AI: 95, Traditional: 85 },
    { name: 'SNR 15dB', AI: 98, Traditional: 90 },
    { name: 'SNR 20dB', AI: 99, Traditional: 95 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Automatic Modulation Recognition</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>AMR Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedWaveform} onValueChange={setSelectedWaveform}>
              <SelectTrigger>
                <SelectValue placeholder="Select waveform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QPSK">QPSK</SelectItem>
                <SelectItem value="8PSK">8PSK</SelectItem>
                <SelectItem value="16APSK">16APSK</SelectItem>
                <SelectItem value="32APSK">32APSK</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAMR} className="w-full">Run AMR</Button>
            {detectedModulation && (
              <div className="mt-4">
                <p className="text-lg font-semibold">Detected Modulation: {detectedModulation}</p>
                <p className="text-lg">Confidence: {confidenceLevel.toFixed(2)}%</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Constellation Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="In-phase" />
                <YAxis type="number" dataKey="y" name="Quadrature" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Constellation" data={generateConstellationData(selectedWaveform)} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AMR Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="AI" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Traditional" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimulationPage() {
  const [snr, setSnr] = useState(20)
  const [dopplerShift, setDopplerShift] = useState(0)
  const [phaseNoise, setPhaseNoise] = useState(false)
  const [berData, setBerData] = useState([])
  const [waveformData, setWaveformData] = useState([])

  useEffect(() => {
    generateData()
  }, [snr, dopplerShift, phaseNoise])

  const generateData = () => {
    const newBerData = Array.from({ length: 10 }, (_, i) => ({
      snr: i * 2,
      ber: Math.exp(-i * 0.5 * (snr / 20)) * 0.1 * (phaseNoise ? 1.2 : 1) * (1 + dopplerShift / 100)
    }))
    setBerData(newBerData)

    const newWaveformData = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      amplitude: Math.sin(i * 0.1 + dopplerShift * i * 0.01) + (Math.random() - 0.5) * (20 / snr) + (phaseNoise ? Math.sin(i * 0.5) * 0.1 : 0)
    }))
    setWaveformData(newWaveformData)
  }

  const generateReport = () => {
    console.log("Generating report...")
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Simulation & Analysis Lab</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">SNR (dB): {snr}</label>
              <Slider
                min={0}
                max={40}
                step={1}
                value={[snr]}
                onValueChange={(value) => setSnr(value[0])}
              />
            </div>
            <div>
              <label className="block mb-2">Doppler Shift (Hz): {dopplerShift}</label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[dopplerShift]}
                onValueChange={(value) => setDopplerShift(value[0])}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="phase-noise"
                checked={phaseNoise}
                onCheckedChange={setPhaseNoise}
              />
              <label htmlFor="phase-noise">Phase Noise</label>
            </div>
            <Button onClick={generateReport} className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>BER vs SNR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={berData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="snr" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ber" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Waveform Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={waveformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amplitude" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UseCasePage() {
  const [selectedUseCase, setSelectedUseCase] = useState(null)

  const useCases = [
    {
      title: "Autonomous Transportation",
      description: "DVB-S2X enables high-bandwidth, low-latency communication for autonomous vehicles and drones.",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "Remote Medical Care",
      description: "Telemedicine and remote surgeries benefit from the reliable, high-quality video transmission of DVB-S2X.",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "Smart Cities",
      description: "DVB-S2X supports the massive data requirements of smart city infrastructure and IoT devices.",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "8K Streaming from Space",
      description: "Ultra-high definition video streaming from satellites becomes possible with DVB-S2X's advanced modulation.",
      image: "/placeholder.svg?height=200&width=300"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">DVB-S2X Use Cases & Impact</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {useCases.map((useCase, index) => (
          <Card key={index} className="cursor-pointer" onClick={() => setSelectedUseCase(useCase)}>
            <CardHeader>
              <CardTitle>{useCase.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={useCase.image} alt={useCase.title} width={300} height={200} className="w-full h-40 object-cover mb-4" />
              <p>{useCase.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedUseCase && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUseCase(null)}
        >
          <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{selectedUseCase.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={selectedUseCase.image} alt={selectedUseCase.title} width={600} height={400} className="w-full h-64 object-cover mb-4" />
              <p>{selectedUseCase.description}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Simulated Demo</h3>
                <p>This is where an interactive demo or animation for {selectedUseCase.title} would be displayed.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function TutorialsPage() {
  const [activeTutorial, setActiveTutorial] = useState(null)

  const tutorials = [
    {
      title: "Introduction to DVB-S2X",
      content: "DVB-S2X is an extension of the DVB-S2 standard, designed to improve efficiency in satellite communications...",
      steps: [
        "Understanding the basics of satellite communication",
        "Key features of DVB-S2X",
        "Comparison with previous standards"
      ]
    },
    {
      title: "Modulation Schemes in DVB-S2X",
      content: "DVB-S2X supports various modulation schemes including QPSK, 8PSK, 16APSK, and 32APSK...",
      steps: [
        "Overview of modulation techniques",
        "QPSK and 8PSK in detail",
        "Advanced modulations: 16APSK and 32APSK"
      ]
    },
    {
      title: "Forward Error Correction (FEC) in DVB-S2X",
      content: "FEC is crucial in satellite communications to ensure data integrity. DVB-S2X uses advanced FEC techniques...",
      steps: [
        "Basics of error correction",
        "LDPC and BCH codes in DVB-S2X",
        "Performance improvements over DVB-S2"
      ]
    },
    {
      title: "Automatic Modulation Recognition Techniques",
      content: "AMR is essential for adaptive communication systems. This tutorial covers various AMR techniques...",
      steps: [
        "Introduction to AMR",
        "Feature extraction methods",
        "Machine learning approaches to AMR"
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Educational Tutorials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tutorials.map((tutorial, index) => (
          <Card key={index} className="cursor-pointer" onClick={() => setActiveTutorial(tutorial)}>
            <CardHeader>
              <CardTitle>{tutorial.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{tutorial.content.substring(0, 100)}...</p>
              <Button className="mt-4">Start Tutorial</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {activeTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setActiveTutorial(null)}>
          <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{activeTutorial.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{activeTutorial.content}</p>
              <Accordion type="single" collapsible>
                {activeTutorial.steps.map((step, index) => (
                  <AccordionItem key={index} value={`step-${index}`}>
                    <AccordionTrigger>Step {index + 1}</AccordionTrigger>
                    <AccordionContent>
                      {step}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button className="mt-4">Download PDF Guide</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ContactPage() {
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() === '') return

    const aiResponse = "Thank you for your question. Our team will get back to you shortly with more information about " + query

    setChatHistory([...chatHistory, { type: 'user', message: query }, { type: 'ai', message: aiResponse }])
    setQuery('')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Contact & Support</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2">Name</label>
                <Input id="name" placeholder="Your Name" />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2">Message</label>
                <Textarea id="message" placeholder="Your message here..." rows={4} />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Support Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-md">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`mb-2 ${chat.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-md ${chat.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    {chat.message}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow mr-2"
              />
              <Button type="submit">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generateConstellationData(modulation) {
  const points = []
  switch (modulation) {
    case 'QPSK':
      points.push({ x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 })
      break
    case '8PSK':
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4
        points.push({ x: Math.cos(angle), y: Math.sin(angle) })
      }
      break
    case '16APSK':
      // Inner ring
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        points.push({ x: 0.5 * Math.cos(angle), y: 0.5 * Math.sin(angle) })
      }
      // Outer ring
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        points.push({ x: Math.cos(angle), y: Math.sin(angle) })
      }
      break
    case '32APSK':
      // Inner ring
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        points.push({ x: 0.3 * Math.cos(angle), y: 0.3 * Math.sin(angle) })
      }
      // Middle ring
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        points.push({ x: 0.6 * Math.cos(angle), y: 0.6 * Math.sin(angle) })
      }
      // Outer ring
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8
        points.push({ x: Math.cos(angle), y: Math.sin(angle) })
      }
      break
  }
  return points
}

export function AppLayout() {
  const [activePage, setActivePage] = useState('home')

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />
      case 'waveform':
        return <WaveformGenerationPage />
      case 'amr':
        return <AMRPage />
      case 'simulation':
        return <SimulationPage />
      case 'use-case':
        return <UseCasePage />
      case 'tutorials':
        return <TutorialsPage />
      case 'contact':
        return <ContactPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Globe className="h-8 w-8" />
            <span className="text-2xl font-bold">DVB-S2X AMR</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" onClick={() => setActivePage('home')}>Home</Button>
            <Button variant="ghost" onClick={() => setActivePage('waveform')}>Waveform</Button>
            <Button variant="ghost" onClick={() => setActivePage('amr')}>AMR</Button>
            <Button variant="ghost" onClick={() => setActivePage('simulation')}>Simulation</Button>
            <Button variant="ghost" onClick={() => setActivePage('use-case')}>Use Cases</Button>
            <Button variant="ghost" onClick={() => setActivePage('tutorials')}>Tutorials</Button>
            <Button variant="ghost" onClick={() => setActivePage('contact')}>Contact</Button>
          </div>
        </nav>
      </header>
      <main className="flex-grow p-4">
        {renderPage()}
      </main>
      <footer className="bg-muted text-muted-foreground p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 DVB-S2X AMR Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}