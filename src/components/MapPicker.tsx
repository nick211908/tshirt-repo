import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (address: AddressData) => void;
}

interface AddressData {
    latitude: number;
    longitude: number;
    address_line_1: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}

function MapPicker({ isOpen, onClose, onLocationSelect }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number]>([20.5937, 78.9629]); // India center
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Fetch current location when modal opens
    useEffect(() => {
        if (isOpen && navigator.geolocation) {
            setFetchingLocation(true);
            const toastId = toast.loading('Getting your current location...');

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPosition);
                    reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                    toast.success('Location detected', { id: toastId });
                    setFetchingLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Could not detect location. Using default.', { id: toastId });
                    setFetchingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        }
    }, [isOpen]);

    const reverseGeocode = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'BeAware-Ecommerce-App',
                    },
                }
            );
            const data = await response.json();

            if (data.address) {
                const addressLine1 = `${data.address.house_number || ''} ${data.address.road || data.address.suburb || ''}`.trim();
                const addressData: AddressData = {
                    latitude: lat,
                    longitude: lng,
                    address_line_1: addressLine1 || data.display_name?.split(',')[0] || '',
                    city: data.address.city || data.address.town || data.address.village || '',
                    state: data.address.state || '',
                    zip_code: data.address.postcode || '',
                    country: 'India',
                };

                setSelectedAddress(data.display_name || 'Address selected');
                return addressData;
            }
            throw new Error('Address not found');
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to fetch address details');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        const addressData = await reverseGeocode(position[0], position[1]);
        if (addressData) {
            onLocationSelect(addressData);
            toast.success('Location selected successfully');
            onClose();
        }
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                reverseGeocode(e.latlng.lat, e.latlng.lng);
            },
        });

        return (
            <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target;
                        const newPos = marker.getLatLng();
                        setPosition([newPos.lat, newPos.lng]);
                        reverseGeocode(newPos.lat, newPos.lng);
                    },
                }}
            />
        );
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-zinc-900">Select Delivery Location</h2>
                            <p className="text-sm text-zinc-500 mt-1">Click or drag the marker to choose your location</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Map */}
                    <div className="relative h-[500px] w-full">
                        <MapContainer
                            key={`${position[0]}-${position[1]}`}
                            center={position}
                            zoom={fetchingLocation ? 5 : 13}
                            className="h-full w-full"
                            style={{ zIndex: 0 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker />
                        </MapContainer>
                    </div>

                    {/* Address Preview */}
                    {selectedAddress && (
                        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                            <p className="text-sm font-medium text-zinc-700">Selected Address:</p>
                            <p className="mt-1 text-sm text-zinc-600">{selectedAddress}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 border-t border-zinc-200 px-6 py-4">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Confirm Location'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default MapPicker;
