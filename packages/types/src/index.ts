// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  BUSINESS_CLIENT = 'BUSINESS_CLIENT',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum ServiceType {
  SAME_DAY = 'SAME_DAY',
  EXPRESS = 'EXPRESS',
  STANDARD = 'STANDARD',
  ECONOMY = 'ECONOMY',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
  TRUCK = 'TRUCK',
}

// ─── API Response Shapes ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: UserPublic;
}

// ─── User ──────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string;
  role: Role;
  phone: string | null;
  isActive: boolean;
  profile: ProfilePublic | null;
}

export interface ProfilePublic {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

// ─── Address ───────────────────────────────────────────────────────────────

export interface AddressDto {
  id: string;
  label: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

// ─── Shipment ──────────────────────────────────────────────────────────────

export interface ShipmentDto {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  weight: number;
  length: number | null;
  width: number | null;
  height: number | null;
  totalPrice: number;
  isCOD: boolean;
  codAmount: number | null;
  notes: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  sender: UserPublic;
  recipient: UserPublic;
  pickupAddress: AddressDto;
  deliveryAddress: AddressDto;
  trackingEvents: TrackingEventDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEventDto {
  id: string;
  status: ShipmentStatus;
  location: string | null;
  notes: string | null;
  timestamp: string;
}

// ─── Price Calculator ──────────────────────────────────────────────────────

export interface PriceEstimateRequest {
  originCity: string;
  destinationCity: string;
  weight: number;
  serviceType: ServiceType;
  isCOD?: boolean;
}

export interface PriceEstimateResponse {
  baseRate: number;
  weightCharge: number;
  distanceCharge: number;
  codSurcharge: number;
  total: number;
  currency: string;
  estimatedDays: number;
}

// ─── Service Areas ─────────────────────────────────────────────────────────

export interface ServiceAreaDto {
  id: string;
  cityName: string;
  region: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

// ─── Blog ──────────────────────────────────────────────────────────────────

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  author: ProfilePublic;
  publishedAt: string | null;
  tags: string[];
  createdAt: string;
}
