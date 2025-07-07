<?php

namespace App\Controller;

use App\Entity\Store;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class StoreController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {}

    #[Route('/store', name: 'get_store', methods: ['GET'])]
    public function getStore(): JsonResponse
    {
        try {
            $store = $this->entityManager
                ->getRepository(Store::class)
                ->findOneBy([]);

            if (!$store) {
                $store = $this->createDefaultStore();
            }

            return $this->json($store, 200, [], ['groups' => ['store:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération des informations du store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/store', name: 'update_store', methods: ['PUT'])]
    public function updateStore(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return $this->json([
                    'message' => 'Données JSON invalides'
                ], 400);
            }

            $store = $this->entityManager
                ->getRepository(Store::class)
                ->findOneBy([]);

            if (isset($data['name'])) {
                $store->setName($data['name']);
            }

            if (isset($data['address'])) {
                $store->setAddress($data['address']);
            }

            if (isset($data['longitude'])) {
                $store->setLongitude($data['longitude']);
            }

            if (isset($data['latitude'])) {
                $store->setLatitude($data['latitude']);
            }

            $store->setUserId($data['userId']);
            

            $this->entityManager->persist($store);
            $this->entityManager->flush();

            return $this->json($store, 200, [], ['groups' => ['store:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour du store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function createDefaultStore(): Store
    {
        $store = new Store();
        $store->setName($_ENV['STORE_NAME']);
        $store->setNameSlug($_ENV['STORE_NAME_SLUG']);
        $store->setAddress($_ENV['STORE_ADDRESS']);
        $store->setLongitude($_ENV['STORE_LONGITUDE']);
        $store->setLatitude($_ENV['STORE_LATITUDE']);
        $store->setUserId($_ENV['USER_ID']);
        $store->setStoreId($_ENV['STORE_ID']);

        $this->entityManager->persist($store);
        $this->entityManager->flush();

        return $store;
    }
} 