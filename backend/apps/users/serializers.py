from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'phone_number',
                  'national_id', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.username = str(validated_data['phone_number'])
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password     = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['phone_number'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        tokens = RefreshToken.for_user(user)
        return {
            'user': UserProfileSerializer(user).data,
            'access':  str(tokens.access_token),
            'refresh': str(tokens),
        }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'first_name', 'last_name', 'phone_number',
                  'national_id', 'email', 'is_verified', 'profile_pic']
        read_only_fields = ['is_verified']
