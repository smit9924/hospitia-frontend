import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLayout } from './auth-layout';

/** Host that projects a form into the layout, like the login and signup pages. */
@Component({
  imports: [AuthLayout],
  template: `<app-auth-layout><form aria-label="Test form"></form></app-auth-layout>`,
})
class AuthLayoutHost {}

describe('AuthLayout', () => {
  let fixture: ComponentFixture<AuthLayoutHost>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutHost],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutHost);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('projects the page content into the form panel', () => {
    expect(element.querySelector('.auth-form-container form[aria-label="Test form"]')).toBeTruthy();
  });

  it('shows the brand panel as a labelled region with the product name and benefits', () => {
    const brandPanel = element.querySelector('section.auth-brand-panel');
    expect(brandPanel?.getAttribute('aria-label')).toBe('About Hospitia');
    expect(brandPanel?.querySelector('.auth-logo-name')?.textContent?.trim()).toBe('Hospitia');
    expect(brandPanel?.querySelectorAll('.auth-brand-benefit').length).toBe(3);
  });

  it('draws a decorative floor illustration colored with the room status classes', () => {
    const illustration = element.querySelector('.auth-brand-illustration');
    expect(illustration?.getAttribute('aria-hidden')).toBe('true');
    const rooms = [...element.querySelectorAll('.auth-brand-illustration-room')];
    expect(rooms.length).toBe(12);
    expect(rooms.every((room) => /room-status--/.test(room.className))).toBe(true);
  });

  it('keeps logo images decorative because the name is shown as text', () => {
    const logos = [...element.querySelectorAll<HTMLImageElement>('.auth-logo img')];
    expect(logos.length).toBe(2);
    expect(logos.every((logo) => logo.getAttribute('alt') === '')).toBe(true);
  });
});
