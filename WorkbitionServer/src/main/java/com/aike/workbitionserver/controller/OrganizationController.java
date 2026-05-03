package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.organization.*;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public Result<OrganizationResponse> createOrganization(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateOrganizationRequest request) {
        OrganizationResponse response = organizationService.createOrganization(user.getId(), request);
        return Result.success("组织创建成功", response);
    }

    @GetMapping
    public Result<List<OrganizationResponse>> getUserOrganizations(@AuthenticationPrincipal User user) {
        List<OrganizationResponse> organizations = organizationService.getUserOrganizations(user.getId());
        return Result.success(organizations);
    }

    @GetMapping("/{orgId}")
    public Result<OrganizationResponse> getOrganization(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId) {
        OrganizationResponse response = organizationService.getOrganization(orgId, user.getId());
        return Result.success(response);
    }

    @PutMapping("/{orgId}")
    public Result<OrganizationResponse> updateOrganization(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId,
            @RequestBody UpdateOrganizationRequest request) {
        OrganizationResponse response = organizationService.updateOrganization(orgId, user.getId(), request);
        return Result.success("组织更新成功", response);
    }

    @DeleteMapping("/{orgId}")
    public Result<Void> deleteOrganization(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId) {
        organizationService.deleteOrganization(orgId, user.getId());
        return Result.success();
    }

    @PostMapping("/{orgId}/members")
    public Result<OrgMemberResponse> addMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId,
            @Valid @RequestBody AddMemberRequest request) {
        OrgMemberResponse response = organizationService.addMember(orgId, user.getId(), request);
        return Result.success("成员添加成功", response);
    }

    @GetMapping("/{orgId}/members")
    public Result<List<OrgMemberResponse>> getMembers(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        List<OrgMemberResponse> members = organizationService.getMembers(orgId, user.getId(), page, size, keyword);
        return Result.success(members);
    }

    @PutMapping("/{orgId}/members/{userId}")
    public Result<OrgMemberResponse> updateMemberRole(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        OrgMemberResponse response = organizationService.updateMemberRole(orgId, user.getId(), userId, request);
        return Result.success("角色变更成功", response);
    }

    @DeleteMapping("/{orgId}/members/{userId}")
    public Result<Void> removeMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long orgId,
            @PathVariable Long userId) {
        organizationService.removeMember(orgId, user.getId(), userId);
        return Result.success();
    }
}
