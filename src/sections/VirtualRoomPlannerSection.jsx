import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import MaterialIcon from '../components/MaterialIcon'

const DEFAULT_ROOM_HEIGHT_METERS = 2.8
const MIN_ROOM_SIZE_METERS = 0.5
const EPSILON = 0.001

const FURNITURE_LIBRARY = [
  {
    id: 'compact-sofa',
    name: 'Compact Sofa',
    width: 1.8,
    height: 0.85,
    length: 0.9,
    thumbnail:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    modelUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF-Binary/BoxTextured.glb',
  },
  {
    id: 'dining-table',
    name: 'Dining Table',
    width: 1.4,
    height: 0.75,
    length: 0.8,
    thumbnail:
      'https://images.unsplash.com/photo-1617098474202-0d0d7f60f3f4?auto=format&fit=crop&w=800&q=80',
    modelUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
  },
  {
    id: 'storage-cabinet',
    name: 'Storage Cabinet',
    width: 0.9,
    height: 1.9,
    length: 0.45,
    thumbnail:
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80',
    modelUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF-Binary/BoxTextured.glb',
  },
]

function parsePositiveNumber(value) {
  const parsedValue = Number.parseFloat(value)
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function disposeObject3D(object) {
  object.traverse((child) => {
    if (!child.isMesh) {
      return
    }

    if (child.geometry) {
      child.geometry.dispose()
    }

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material?.dispose?.())
      return
    }

    child.material?.dispose?.()
  })
}

function formatMeters(value) {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function VirtualRoomPlannerSection() {
  const [roomForm, setRoomForm] = useState({
    width: '4',
    length: '5',
    height: String(DEFAULT_ROOM_HEIGHT_METERS),
  })
  const [generatedRoom, setGeneratedRoom] = useState(null)
  const [loadingFurnitureId, setLoadingFurnitureId] = useState(null)
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null)
  const [statusMessage, setStatusMessage] = useState({ kind: '', text: '' })
  const [fitWarning, setFitWarning] = useState('')
  const [placedItems, setPlacedItems] = useState([])

  const plannerRootRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const loaderRef = useRef(null)
  const raycasterRef = useRef(null)
  const pointerRef = useRef(null)
  const animationFrameRef = useRef(0)

  const roomGroupRef = useRef(null)
  const furnitureGroupRef = useRef(null)
  const floorMeshRef = useRef(null)
  const roomDimensionsRef = useRef(null)
  const selectedFurnitureIdRef = useRef(null)
  const rotateSelectedFurnitureRef = useRef(() => {})
  const updateFitIndicatorsRef = useRef(() => {})
  const draggingRef = useRef({
    isDragging: false,
    furnitureId: null,
  })
  const modelCacheRef = useRef(new Map())
  const furnitureEntriesRef = useRef(new Map())

  useEffect(() => {
    selectedFurnitureIdRef.current = selectedFurnitureId
  }, [selectedFurnitureId])

  const selectedFurniture = useMemo(
    () => placedItems.find((item) => item.id === selectedFurnitureId) ?? null,
    [placedItems, selectedFurnitureId],
  )

  function updateRoomFormField(field, value) {
    setRoomForm((prev) => ({ ...prev, [field]: value }))
  }

  function syncPlacedItemsState() {
    const nextItems = Array.from(furnitureEntriesRef.current.values()).map((entry) => ({
      id: entry.id,
      name: entry.name,
      fits: entry.fits,
    }))
    setPlacedItems(nextItems)
  }

  function clearStatusAfterDelay(messageKind, messageText) {
    setStatusMessage({ kind: messageKind, text: messageText })
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev.text === messageText ? { kind: '', text: '' } : prev))
    }, 2200)
  }

  function applyFitTint(rootObject, fits) {
    rootObject.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material]

      materials.forEach((material) => {
        if (!material.userData.__plannerBaseState) {
          material.userData.__plannerBaseState = {
            color: material.color ? material.color.clone() : null,
            emissive: material.emissive ? material.emissive.clone() : null,
          }
        }

        const baseState = material.userData.__plannerBaseState

        if (fits) {
          if (material.color && baseState.color) {
            material.color.copy(baseState.color)
          }
          if (material.emissive && baseState.emissive) {
            material.emissive.copy(baseState.emissive)
          }
          return
        }

        if (material.color) {
          material.color.set('#ef4444')
        }
        if (material.emissive) {
          material.emissive.set('#7f1d1d')
        }
      })
    })
  }

  function snapObjectToFloor(entry) {
    const bounds = new THREE.Box3().setFromObject(entry.object)
    if (Math.abs(bounds.min.y) > EPSILON) {
      entry.object.position.y -= bounds.min.y
      entry.object.updateMatrixWorld(true)
    }
  }

  function checkIfFurnitureFitsRoom(entry) {
    const roomDimensions = roomDimensionsRef.current
    if (!roomDimensions) {
      return true
    }

    const bounds = new THREE.Box3().setFromObject(entry.object)
    const size = new THREE.Vector3()
    bounds.getSize(size)

    const halfWidth = size.x / 2
    const halfLength = size.z / 2
    const fitsByWidth = Math.abs(entry.object.position.x) + halfWidth <= roomDimensions.width / 2 + EPSILON
    const fitsByLength = Math.abs(entry.object.position.z) + halfLength <= roomDimensions.length / 2 + EPSILON
    const fitsByHeight = bounds.max.y <= roomDimensions.height + EPSILON

    return fitsByWidth && fitsByLength && fitsByHeight
  }

  function updateFitIndicators() {
    const outOfBoundsItems = []

    furnitureEntriesRef.current.forEach((entry) => {
      snapObjectToFloor(entry)
      const fits = checkIfFurnitureFitsRoom(entry)
      entry.fits = fits

      applyFitTint(entry.object, fits)

      if (!fits) {
        outOfBoundsItems.push(entry.name)
      }
    })

    if (outOfBoundsItems.length > 0) {
      setFitWarning(`${outOfBoundsItems.join(', ')} does not fit inside the room boundaries.`)
    } else {
      setFitWarning('')
    }

    syncPlacedItemsState()
  }

  function clearRoomMeshes() {
    const roomGroup = roomGroupRef.current
    if (!roomGroup) {
      return
    }

    while (roomGroup.children.length > 0) {
      const child = roomGroup.children.pop()
      disposeObject3D(child)
    }

    floorMeshRef.current = null
  }

  function clearFurnitureFromScene() {
    const furnitureGroup = furnitureGroupRef.current
    if (!furnitureGroup) {
      return
    }

    furnitureEntriesRef.current.forEach((entry) => {
      furnitureGroup.remove(entry.object)
      disposeObject3D(entry.object)
    })

    furnitureEntriesRef.current.clear()
    setPlacedItems([])
    setSelectedFurnitureId(null)
    setFitWarning('')
  }

  function createRoom(width, length, height) {
    const roomGroup = roomGroupRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current

    if (!roomGroup || !camera || !controls) {
      return
    }

    clearRoomMeshes()

    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#efe9df', roughness: 0.92 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    floor.name = 'planner-floor'
    roomGroup.add(floor)
    floorMeshRef.current = floor

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      roughness: 0.8,
    })

    const northWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial.clone())
    northWall.position.set(0, height / 2, -length / 2)
    roomGroup.add(northWall)

    const southWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial.clone())
    southWall.position.set(0, height / 2, length / 2)
    southWall.rotation.y = Math.PI
    roomGroup.add(southWall)

    const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wallMaterial.clone())
    eastWall.position.set(width / 2, height / 2, 0)
    eastWall.rotation.y = -Math.PI / 2
    roomGroup.add(eastWall)

    const westWall = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wallMaterial.clone())
    westWall.position.set(-width / 2, height / 2, 0)
    westWall.rotation.y = Math.PI / 2
    roomGroup.add(westWall)

    const gridSize = Math.max(width, length)
    const gridDivisions = Math.max(8, Math.round(gridSize * 2))
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x9ca3af, 0xd1d5db)
    grid.position.y = 0.01
    roomGroup.add(grid)

    controls.target.set(0, height * 0.35, 0)
    camera.position.set(width * 1.2, height * 1.15, length * 1.2)
    controls.update()

    roomDimensionsRef.current = { width, length, height }
    setGeneratedRoom({ width, length, height })
  }

  function handleGenerateRoom() {
    const width = parsePositiveNumber(roomForm.width)
    const length = parsePositiveNumber(roomForm.length)
    const roomHeightInput = roomForm.height.trim()
    const height = roomHeightInput.length === 0
      ? DEFAULT_ROOM_HEIGHT_METERS
      : parsePositiveNumber(roomHeightInput)

    if (!width || width < MIN_ROOM_SIZE_METERS || !length || length < MIN_ROOM_SIZE_METERS) {
      setStatusMessage({
        kind: 'error',
        text: `Room width and length must be at least ${MIN_ROOM_SIZE_METERS}m.`,
      })
      return
    }

    if (!height || height < MIN_ROOM_SIZE_METERS) {
      setStatusMessage({
        kind: 'error',
        text: `Room height must be at least ${MIN_ROOM_SIZE_METERS}m.`,
      })
      return
    }

    clearFurnitureFromScene()
    createRoom(width, length, height)
    clearStatusAfterDelay(
      'success',
      `Room generated: ${formatMeters(width)}m x ${formatMeters(length)}m x ${formatMeters(height)}m`,
    )
  }

  async function getModelClone(modelUrl) {
    const loader = loaderRef.current
    if (!loader) {
      throw new Error('3D loader is not ready.')
    }

    let modelPromise = modelCacheRef.current.get(modelUrl)
    if (!modelPromise) {
      modelPromise = new Promise((resolve, reject) => {
        loader.load(
          modelUrl,
          (gltf) => resolve(gltf.scene),
          undefined,
          (error) => reject(error),
        )
      })
      modelCacheRef.current.set(modelUrl, modelPromise)
    }

    try {
      const cachedScene = await modelPromise
      const clone = cachedScene.clone(true)

      clone.traverse((child) => {
        if (!child.isMesh) {
          return
        }

        child.castShadow = true
        child.receiveShadow = true

        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => material.clone())
          return
        }

        child.material = child.material.clone()
      })

      return clone
    } catch (error) {
      modelCacheRef.current.delete(modelUrl)
      throw error
    }
  }

  function normalizeAndScaleFurnitureModel(model, targetDimensions) {
    model.updateMatrixWorld(true)

    const initialBounds = new THREE.Box3().setFromObject(model)
    const initialCenter = new THREE.Vector3()
    initialBounds.getCenter(initialCenter)

    model.position.sub(initialCenter)
    model.position.y -= initialBounds.min.y
    model.updateMatrixWorld(true)

    const normalizedBounds = new THREE.Box3().setFromObject(model)
    const normalizedSize = new THREE.Vector3()
    normalizedBounds.getSize(normalizedSize)

    const scaleX = targetDimensions.width / Math.max(normalizedSize.x, 0.01)
    const scaleY = targetDimensions.height / Math.max(normalizedSize.y, 0.01)
    const scaleZ = targetDimensions.length / Math.max(normalizedSize.z, 0.01)

    model.scale.set(scaleX, scaleY, scaleZ)
    model.updateMatrixWorld(true)

    const scaledBounds = new THREE.Box3().setFromObject(model)
    model.position.y -= scaledBounds.min.y
    model.updateMatrixWorld(true)
  }

  async function handleAddFurniture(furnitureItem) {
    if (!generatedRoom) {
      setStatusMessage({
        kind: 'error',
        text: 'Generate a room first before adding furniture.',
      })
      return
    }

    setLoadingFurnitureId(furnitureItem.id)

    try {
      const model = await getModelClone(furnitureItem.modelUrl)
      normalizeAndScaleFurnitureModel(model, furnitureItem)

      const furnitureId = `${furnitureItem.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
      model.userData.isFurnitureRoot = true
      model.userData.furnitureId = furnitureId
      model.position.set(0, 0, 0)

      const furnitureGroup = furnitureGroupRef.current
      if (!furnitureGroup) {
        return
      }

      furnitureGroup.add(model)

      furnitureEntriesRef.current.set(furnitureId, {
        id: furnitureId,
        name: furnitureItem.name,
        object: model,
        fits: true,
      })

      setSelectedFurnitureId(furnitureId)
      syncPlacedItemsState()
      updateFitIndicators()
      clearStatusAfterDelay('success', `${furnitureItem.name} added to room.`)
    } catch {
      setStatusMessage({
        kind: 'error',
        text: `Failed to load ${furnitureItem.name}. Try another item.`,
      })
    } finally {
      setLoadingFurnitureId(null)
    }
  }

  function rotateSelectedFurniture() {
    const selectedId = selectedFurnitureIdRef.current
    if (!selectedId) {
      return
    }

    const selectedEntry = furnitureEntriesRef.current.get(selectedId)
    if (!selectedEntry) {
      return
    }

    selectedEntry.object.rotation.y += Math.PI / 2
    selectedEntry.object.updateMatrixWorld(true)
    snapObjectToFloor(selectedEntry)
    updateFitIndicators()
    clearStatusAfterDelay('success', `${selectedEntry.name} rotated.`)
  }

  function removeSelectedFurniture() {
    const selectedId = selectedFurnitureIdRef.current
    if (!selectedId) {
      return
    }

    const selectedEntry = furnitureEntriesRef.current.get(selectedId)
    if (!selectedEntry) {
      return
    }

    const furnitureGroup = furnitureGroupRef.current
    if (furnitureGroup) {
      furnitureGroup.remove(selectedEntry.object)
    }
    disposeObject3D(selectedEntry.object)
    furnitureEntriesRef.current.delete(selectedId)

    setSelectedFurnitureId(null)
    syncPlacedItemsState()
    updateFitIndicators()
    clearStatusAfterDelay('success', `${selectedEntry.name} removed from room.`)
  }

  rotateSelectedFurnitureRef.current = rotateSelectedFurniture
  updateFitIndicatorsRef.current = updateFitIndicators

  useEffect(() => {
    const rootElement = plannerRootRef.current
    if (!rootElement) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8f6f2')
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      55,
      rootElement.clientWidth / Math.max(rootElement.clientHeight, 1),
      0.1,
      250,
    )
    camera.position.set(7, 5.5, 7)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(rootElement.clientWidth, rootElement.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    rootElement.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.set(0, 1, 0)
    controls.maxPolarAngle = Math.PI * 0.495
    controls.minDistance = 1.5
    controls.maxDistance = 35
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1)
    directionalLight.position.set(8, 12, 6)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(2048, 2048)
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 60
    scene.add(directionalLight)

    const roomGroup = new THREE.Group()
    roomGroup.name = 'room-group'
    roomGroupRef.current = roomGroup
    scene.add(roomGroup)

    const furnitureGroup = new THREE.Group()
    furnitureGroup.name = 'furniture-group'
    furnitureGroupRef.current = furnitureGroup
    scene.add(furnitureGroup)

    loaderRef.current = new GLTFLoader()
    raycasterRef.current = new THREE.Raycaster()
    pointerRef.current = new THREE.Vector2()

    const handleResize = () => {
      const nextWidth = rootElement.clientWidth
      const nextHeight = rootElement.clientHeight
      if (!nextWidth || !nextHeight) {
        return
      }

      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }

    const getFurnitureRootFromObject = (object) => {
      let current = object
      while (current && !current.userData?.isFurnitureRoot) {
        current = current.parent
      }

      return current?.userData?.isFurnitureRoot ? current : null
    }

    const updatePointerFromEvent = (event) => {
      const canvasBounds = renderer.domElement.getBoundingClientRect()
      pointerRef.current.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
      pointerRef.current.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
    }

    const handlePointerDown = (event) => {
      if (!raycasterRef.current || !pointerRef.current) {
        return
      }

      updatePointerFromEvent(event)
      raycasterRef.current.setFromCamera(pointerRef.current, camera)

      const intersections = raycasterRef.current.intersectObjects(furnitureGroup.children, true)
      if (intersections.length === 0) {
        setSelectedFurnitureId(null)
        return
      }

      const targetRoot = getFurnitureRootFromObject(intersections[0].object)
      if (!targetRoot) {
        return
      }

      const selectedId = targetRoot.userData.furnitureId
      draggingRef.current = {
        isDragging: true,
        furnitureId: selectedId,
      }
      setSelectedFurnitureId(selectedId)
      controls.enabled = false
      renderer.domElement.style.cursor = 'grabbing'
    }

    const handlePointerMove = (event) => {
      const floorMesh = floorMeshRef.current
      if (!floorMesh || !draggingRef.current.isDragging || !draggingRef.current.furnitureId) {
        return
      }

      updatePointerFromEvent(event)
      raycasterRef.current.setFromCamera(pointerRef.current, camera)

      const floorIntersections = raycasterRef.current.intersectObject(floorMesh, false)
      if (floorIntersections.length === 0) {
        return
      }

      const draggedEntry = furnitureEntriesRef.current.get(draggingRef.current.furnitureId)
      if (!draggedEntry) {
        return
      }

      const intersectionPoint = floorIntersections[0].point
      draggedEntry.object.position.x = intersectionPoint.x
      draggedEntry.object.position.z = intersectionPoint.z
      draggedEntry.object.position.y = 0
      draggedEntry.object.updateMatrixWorld(true)

      updateFitIndicatorsRef.current()
    }

    const handlePointerUp = () => {
      if (!draggingRef.current.isDragging) {
        return
      }

      draggingRef.current = {
        isDragging: false,
        furnitureId: null,
      }
      controls.enabled = true
      renderer.domElement.style.cursor = 'default'
    }

    const handleKeydown = (event) => {
      if (event.key.toLowerCase() === 'r') {
        rotateSelectedFurnitureRef.current()
      }
    }

    const animate = () => {
      animationFrameRef.current = window.requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)
    renderer.domElement.addEventListener('pointerleave', handlePointerUp)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeydown)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      renderer.domElement.removeEventListener('pointerleave', handlePointerUp)

      window.cancelAnimationFrame(animationFrameRef.current)
      controls.dispose()
      clearRoomMeshes()
      clearFurnitureFromScene()
      renderer.dispose()

      if (renderer.domElement.parentElement === rootElement) {
        rootElement.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <section className="bg-background-light py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Virtual Room Planner</p>
          <h2 className="mt-2 text-3xl font-black text-neutral-dark">Plan Your Room in 3D</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-dark/60">
            Set room dimensions, generate your 3D room, then add and arrange furniture. Drag items
            with your mouse, and press `R` to rotate selected furniture.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:p-6">
            <section>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-dark text-xs font-bold text-white">
                  1
                </span>
                <h3 className="text-lg font-bold text-neutral-dark">Room Setup</h3>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="planner-room-width">
                    Room Width (m)
                  </label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    id="planner-room-width"
                    min={MIN_ROOM_SIZE_METERS}
                    onChange={(event) => updateRoomFormField('width', event.target.value)}
                    step="0.1"
                    type="number"
                    value={roomForm.width}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="planner-room-length">
                    Room Length (m)
                  </label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    id="planner-room-length"
                    min={MIN_ROOM_SIZE_METERS}
                    onChange={(event) => updateRoomFormField('length', event.target.value)}
                    step="0.1"
                    type="number"
                    value={roomForm.length}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-dark/60" htmlFor="planner-room-height">
                    Room Height (m, optional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    id="planner-room-height"
                    min={MIN_ROOM_SIZE_METERS}
                    onChange={(event) => updateRoomFormField('height', event.target.value)}
                    placeholder={String(DEFAULT_ROOM_HEIGHT_METERS)}
                    step="0.1"
                    type="number"
                    value={roomForm.height}
                  />
                </div>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-dark px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-dark/90"
                  onClick={handleGenerateRoom}
                  type="button"
                >
                  <MaterialIcon className="text-base" name="architecture" />
                  Generate Room
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-dark text-xs font-bold text-white">
                  2
                </span>
                <h3 className="text-lg font-bold text-neutral-dark">Furniture Library</h3>
              </div>

              <div className="mt-4 space-y-3">
                {FURNITURE_LIBRARY.map((item) => (
                  <article key={item.id} className="rounded-xl border border-primary/10 p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-background-light">
                      <img alt={item.name} className="h-full w-full object-cover" src={item.thumbnail} />
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-bold text-neutral-dark">{item.name}</p>
                      <p className="mt-1 text-xs text-neutral-dark/60">
                        {formatMeters(item.width)}m x {formatMeters(item.length)}m x {formatMeters(item.height)}m
                      </p>
                    </div>

                    <button
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loadingFurnitureId === item.id}
                      onClick={() => handleAddFurniture(item)}
                      type="button"
                    >
                      <MaterialIcon className="text-base" name="add" />
                      {loadingFurnitureId === item.id ? 'Loading model...' : 'Add to Room'}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-dark/60">Selected Item</p>
              {selectedFurniture ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-semibold text-neutral-dark">{selectedFurniture.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg bg-neutral-dark px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-neutral-dark/90"
                      onClick={rotateSelectedFurniture}
                      type="button"
                    >
                      <MaterialIcon className="text-sm" name="rotate_right" />
                      Rotate (R)
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-dark transition-colors hover:bg-primary/10"
                      onClick={removeSelectedFurniture}
                      type="button"
                    >
                      <MaterialIcon className="text-sm" name="delete" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-neutral-dark/60">Click a furniture item in the scene to select it.</p>
              )}
            </section>
          </aside>

          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
            <div ref={plannerRootRef} className="h-[30rem] w-full sm:h-[36rem]" />

            {generatedRoom && (
              <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-primary/20 bg-white/95 px-3 py-2 text-xs text-neutral-dark/70 shadow-sm">
                Room: {formatMeters(generatedRoom.width)}m x {formatMeters(generatedRoom.length)}m x{' '}
                {formatMeters(generatedRoom.height)}m | 1 grid unit = 1m
              </div>
            )}

            {!generatedRoom && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="rounded-xl border border-primary/20 bg-white/90 px-5 py-4 text-sm text-neutral-dark/70 shadow-sm">
                  Fill out room dimensions and click Generate Room to start planning.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {statusMessage.text && (
            <div
              className={`rounded-lg border px-4 py-2 text-sm ${
                statusMessage.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {fitWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {fitWarning}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default VirtualRoomPlannerSection
