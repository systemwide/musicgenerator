# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.utils import timezone

# Create your models here.


class Note(models.Model):
    id = models.AutoField(primary_key=True)
    onset = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    pitch = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    duration = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    velocity = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    channel = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    avg_rating = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    song = models.ForeignKey('termproject.Song', db_index=True, max_length=200, null=True, blank=True)


class Rating(models.Model):
    id = models.AutoField(primary_key=True)
    note = models.ForeignKey('termproject.Note')
    user = models.ForeignKey('auth.User')
    rating = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)


class Song(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    model = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)
