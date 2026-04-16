// Configuration globale pour les tests Jasmine
import 'zone.js/testing';

// Déclarations globales pour tous les tests
declare const jasmine: any;
declare const spyOn: any;
declare const fail: any;

// Rendre les déclarations disponibles globalement
(global as any).jasmine = jasmine;
(global as any).spyOn = spyOn;
(global as any).fail = fail;
