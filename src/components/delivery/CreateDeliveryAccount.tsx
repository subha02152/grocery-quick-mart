import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Building, MapPin, Phone, User, Truck, CheckCircle } from 'lucide-react';
import { toast } from '../../utils/toast';
import { deliveryAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const CreateDeliveryAccount = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    address: '',
    licenseNumber: '',
    mobileNumber: '',
    vehicleType: '',
    vehicleNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.agencyName.trim()) {
      toast.error('Agency name is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.licenseNumber.trim()) {
      toast.error('License number is required');
      return false;
    }
    if (!formData.mobileNumber.trim()) {
      toast.error('Mobile number is required');
      return false;
    }
    if (!formData.vehicleType) {
      toast.error('Please select a vehicle type');
      return false;
    }
    if (!formData.vehicleNumber.trim()) {
      toast.error('Vehicle number is required');
      return false;
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      console.log('🚚 Submitting delivery account data:', formData);
      
      // Call the API
      const response = await deliveryAPI.createDeliveryAccount(formData);
      
      console.log('✅ Response from server:', response);
      
      if (response.success) {
        toast.success(response.message || 'Delivery account created successfully!');
        setSuccess(true);
        
        // Reset form
        setFormData({
          agencyName: '',
          address: '',
          licenseNumber: '',
          mobileNumber: '',
          vehicleType: '',
          vehicleNumber: ''
        });
        
        // Optional: You can redirect manually or just show success
        // Commented out to prevent redirect loop
        // setTimeout(() => {
        //   window.location.href = '/delivery/dashboard';
        // }, 2000);
      } else {
        toast.error(response.message || 'Failed to create delivery account');
        setSuccess(false);
      }
    } catch (error: any) {
      console.error('❌ Delivery account creation error:', error);
      setSuccess(false);
      
      // Handle different error types
      if (error?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || 'Invalid data provided';
        toast.error(errorMessage);
      } else if (error?.response?.status === 403) {
        toast.error('You do not have permission to create a delivery account');
      } else if (error?.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create delivery account';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <Truck className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Delivery Account</h2>
            <p className="text-sm text-gray-600 mt-1">Register as a delivery partner</p>
          </div>
        </div>
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Account created successfully!</p>
              <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agency Name */}
            <div>
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Agency Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="agencyName"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Swift Delivery Services"
                />
              </div>
            </div>

            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                License Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., DL-1234567890"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading || success}
                rows={2}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                disabled={loading || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike 🏍️</option>
                <option value="scooter">Scooter 🛵</option>
                <option value="car">Car 🚗</option>
                <option value="bicycle">Bicycle 🚴</option>
                <option value="truck">Truck 🚚</option>
                <option value="van">Van 🚐</option>
              </select>
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setFormData({
                    ...formData,
                    vehicleNumber: upperValue
                  });
                }}
                required
                disabled={loading || success}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                placeholder="e.g., ABC-1234"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Account Created Successfully!
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-5 w-5" />
                  Create Delivery Account
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure you have a valid driving license and vehicle documents before registering.
            </p>
          </div>
        </form>
      </div>

      {loading && <Loading />}
    </div>
  );
};

export default CreateDeliveryAccount;