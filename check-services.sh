#!/bin/bash
# 클러스터의 실제 서비스 확인

export KUBECONFIG=../c4ang-infra/environments/dev/kubeconfig/config

echo "=== ecommerce namespace의 모든 리소스 확인 ==="
echo ""

echo "1. Deployments:"
kubectl get deployments -n ecommerce
echo ""

echo "2. Services:"
kubectl get svc -n ecommerce
echo ""

echo "3. Pods:"
kubectl get pods -n ecommerce
echo ""

echo "4. HTTPRoutes:"
kubectl get httproute -n ecommerce
echo ""
