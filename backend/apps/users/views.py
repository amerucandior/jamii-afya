from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer

import random

from django.utils import timezone

from .models import *


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = 'admin' if user.is_staff else 'member'
    refresh['id'] = user.id
    return {
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'role': 'admin' if user.is_staff else 'member',
        'id': user.id,
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created. Verify your phone to continue.'},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
