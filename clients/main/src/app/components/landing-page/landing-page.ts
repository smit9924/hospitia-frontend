import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { appRoutes } from '../../data/app-routes';

interface RoomType {
  id: number;
  name: string;
  price: number;
  description: string;
  capacity: number;
  amenities: string[];
  image: string;
}

interface Amenity {
  icon: string;
  name: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  private router = inject(Router);
  appRoutes = appRoutes;

  roomTypes: RoomType[] = [
    {
      id: 1,
      name: 'Standard Room',
      price: 950,
      description: 'Comfortable and affordable room perfect for budget-conscious travelers',
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'Shared Bathroom', 'TV'],
      image: 'assets/images/two-sharing-room.jpg',
    },
    {
      id: 2,
      name: 'Deluxe Room',
      price: 1400,
      description: 'Spacious room with premium amenities for enhanced comfort',
      capacity: 3,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Minibar'],
      image: 'assets/images/three-sharing-room.jpg',
    },
    {
      id: 3,
      name: 'Family Suite',
      price: 4000,
      description: 'Ideal for families with separate living and sleeping areas',
      capacity: 4,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Kitchen'],
      image: 'assets/images/hall.jpg',
    },
  ];

  amenities: Amenity[] = [
    {
      icon: 'wifi',
      name: 'Free WiFi',
      description: 'High-speed internet connectivity throughout the property',
    },
    {
      icon: 'restaurant',
      name: 'Multi-cuisine Restaurant',
      description: 'Delicious meals prepared with fresh, local ingredients',
    },
    {
      icon: 'exercise',
      name: 'Fitness Center',
      description: 'Modern gym equipment for your wellness needs',
    },
    {
      icon: 'businessCenter',
      name: 'Business Center',
      description: 'Fully equipped workspace for business travelers',
    },
    {
      icon: 'parkingSign',
      name: 'Free Parking',
      description: 'Secure and spacious parking facility for all guests',
    },
    {
      icon: 'spa',
      name: 'Wellness Spa',
      description: 'Relaxation and rejuvenation services available',
    },
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Raj Kumar',
      role: 'Business Traveler',
      content:
        'Yatri Bhavan provided exceptional service at an affordable price. The staff was incredibly helpful and the rooms were clean and comfortable. Highly recommended!',
      rating: 5,
      image: 'assets/images/man-1.jpg',
    },
    {
      name: 'Priya Sharma',
      role: 'Tourist',
      content:
        "My family loved staying here. The warm hospitality and affordable rates made our vacation perfect. We'll definitely come back again!",
      rating: 4,
      image: 'assets/images/woman-1.jpg',
    },
    {
      name: 'Anil Patel',
      role: 'NGO Worker',
      content:
        "Supporting an NGO while enjoying quality accommodation? That's a win-win. Yatri Bhavan truly makes a difference in the community.",
      rating: 3,
      image: 'assets/images/man-2.jpg',
    },
  ];

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToBooking(): void {
    this.router.navigate([appRoutes.customerDashboard]);
  }

  submitContactForm(): void {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      // Here you would typically send the data to your backend
      alert('Thank you for contacting us! We will get back to you soon.');
      this.contactForm.reset();
    }
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
